import Axios, { AxiosError, AxiosInstance } from "axios";

enum Errors {
  MissingCredentials = "Credentials doesnt exists",
  MissingDepositId = "The deposit isnt exist",
}

interface Response<Data = unknown, ErrorData = unknown> {
  success: boolean;
  data?: Data;
  error?: {
    code: number;
    message: string;
    details?: ErrorData | string;
  };
}

interface Token {
  access_token: string;
  token_type: "bearer";
  expires_in: number;
}

interface Deposit {
  Id: number;
  Nombre: string;
  Activo: boolean;
}

interface StockItem {
  Id: number;
  Codigo: string;
  StockActual: number;
  StockReservado: number;
  StockConReservas: number;
}

interface ProductStock {
  Id: number;
  Codigo: string;
  StockActual: number;
  StockReservado: number;
  StockConReservas: number;
  stock: StockItem[];
}

export default class ContabiliumService {
  private client: AxiosInstance;

  constructor() {
    this.client = Axios.create({ baseURL: "https://rest.contabilium.com" });
  }

  private async getToken() {
    const user = process.env.CONTABILIUM_USER;
    const password = process.env.CONTABILIUM_PASSWORD;

    if (!password || !user) throw new Error(Errors.MissingCredentials);

    const response = await this.client.post<Token>(
      "/token",
      new URLSearchParams({
        grant_type: "client_credentials",
        client_id: user,
        client_secret: password,
      })
    );

    return response.data;
  }

  async authenticate(): Promise<Response> {
    try {
      const authToken = (await this.getToken()).access_token;

      this.client.interceptors.request.use((request) => {
        request.headers["Authorization"] = `Bearer ${authToken}`;
        return request;
      });

      return { success: true };
    } catch (error) {
      const axiosError = error as AxiosError;
      return {
        success: false,
        error: {
          code: axiosError?.status || 500,
          message: "Error on authentication",
        },
      };
    }
  }

  async getUserInfo() {
    const response = await this.client.get("api/usuarios/obtenerinfo");
    return response.data;
  }

  async getDeposits(): Promise<Response<Deposit[]>> {
    try {
      const response = await this.client.get<Deposit[]>(
        "api/inventarios/getDepositos"
      );
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      const axiosError = error as AxiosError;
      return {
        success: false,
        error: {
          code: axiosError?.status || 500,
          message: "Error on get deposits",
        },
      };
    }
  }

  async modifyStock(
    depositId: number,
    productId: number | undefined,
    sku: string,
    newStock: number
  ): Promise<Response> {
    try {
      let productStock: ProductStock | undefined = undefined;
      if (productId === undefined) {
        const productStockResponse = await this.getProductStock(sku);
        if (!productStockResponse.success) return productStockResponse;

        productStock = productStockResponse.data as ProductStock;
      }

      const response = await this.client.post(
        `api/inventarios/modificarStock?id=${depositId}&idConcepto=${
          productId ?? productStock?.Id
        }&cantidad=${newStock}`
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      const axiosError = error as AxiosError;
      return {
        success: false,
        error: {
          code: axiosError?.status || 500,
          message: "Error at modify stock",
        },
      };
    }
  }

  async getProductStock(sku: string): Promise<Response<ProductStock>> {
    try {
      const response = await this.client.get<ProductStock>(
        `api/inventarios/getStockBySKU?codigo=${sku}`
      );

      return { success: true, data: response.data };
    } catch (error) {
      const axiosError = error as AxiosError;
      return {
        success: false,
        error: {
          code: axiosError?.status || 500,
          message: "error on get product stock",
          details: `product sku: ${sku}`,
        },
      };
    }
  }

  async createMovement(
    originDepositId: number,
    destinyDepositId: number,
    sku: string,
    quantity: number
  ): Promise<Response> {
    try {
      const response = await this.client.post(
        `api/inventarios/movimientoInterno?idDepositoOrigen=${originDepositId}&idDepositoDestino=${destinyDepositId}&codigo=${sku}&cantidad=${quantity}`
      );
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      const axiosError = error as AxiosError;
      return {
        success: false,
        error: {
          code: axiosError?.status || 500,
          message: "error at create movement",
        },
      };
    }
  }

  async modifyStockWithMovements(
    originDepositId: number,
    destinyDepositId: number,
    sku: string,
    newStock: number
  ): Promise<Response> {
    const productStockResponse = await this.getProductStock(sku);

    if (!productStockResponse.success) return productStockResponse;

    const productStock = productStockResponse.data as ProductStock;

    const originDeposit = productStock.stock.find(
      ({ Id }) => Id === originDepositId
    );

    const destinyDeposit = productStock.stock.find(
      ({ Id }) => Id === destinyDepositId
    );

    if (originDeposit === undefined || destinyDeposit === undefined)
      return {
        success: false,
        error: {
          code: 404,
          message: "Origin deposit not found",
        },
      };

    const differenceBetweenOriginDepositStockAndNewStock =
      newStock - originDeposit.StockActual;

    const stockToMove =
      differenceBetweenOriginDepositStockAndNewStock <= 0
        ? newStock
        : differenceBetweenOriginDepositStockAndNewStock;

    if (differenceBetweenOriginDepositStockAndNewStock > 0) {
      const modifyStockResponse = await this.modifyStock(
        destinyDepositId,
        productStock.Id,
        sku,
        differenceBetweenOriginDepositStockAndNewStock
      );

      if (!modifyStockResponse.success) return modifyStockResponse;
    }

    if (stockToMove === 0)
      return {
        success: true,
      };

    const createMovementResponse = await this.createMovement(
      originDepositId,
      destinyDepositId,
      sku,
      stockToMove
    );

    if (!createMovementResponse.success) {
      const modifyStockResponse = await this.modifyStock(
        destinyDepositId,
        productStock.Id,
        sku,
        destinyDeposit.StockActual
      );

      if (!modifyStockResponse.success) return modifyStockResponse;
    }

    return {
      success: true,
    };
  }
}

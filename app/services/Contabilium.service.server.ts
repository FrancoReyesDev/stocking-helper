import Axios, { AxiosError, AxiosInstance } from "axios";

enum Errors {
  MissingCredentials = "Credentials doesnt exists",
}

interface Token {
  access_token: string;
  token_type: "bearer";
  expires_in: number;
}

export default class ContabiliumService {
  private client: AxiosInstance;

  constructor() {
    this.client = Axios.create({ baseURL: "https://rest.contabilium.com" });
  }

  async authenticate() {
    const authToken = (await this.getToken()).access_token;

    this.client.interceptors.request.use((request) => {
      request.headers["Authorization"] = `Bearer ${authToken}`;
      return request;
    });
  }

  private async getToken() {
    const user = process.env.CONTABILIUM_USER;
    const password = process.env.CONTABILIUM_PASSWORD;

    if (!password || !user) throw new Error(Errors.MissingCredentials);

    try {
      const response = await this.client.post<Token>(
        "/token",
        new URLSearchParams({
          grant_type: "client_credentials",
          client_id: user,
          client_secret: password,
        })
      );

      return response.data;
    } catch (error) {
      console.error({ error, stack: "getToken" });
      throw new Error();
    }
  }

  async getUserInfo() {
    const response = await this.client.get("api/usuarios/obtenerinfo");
    return response.data;
  }

  async getDeposits() {
    const response = await this.client.get("api/inventarios/getDepositos");
    return response.data;
  }

  async modifyStock(depositId: number, productId: number, newStock: number) {
    this.client.post(
      `api/inventarios/modificarStock?id=${depositId}&idConcepto=${productId}&cantidad=${newStock}`
    );
  }

  async getProductStock(sku: string) {
    const response = await this.client.get(
      `api/inventarios/getStockBySKU?codigo=${sku}`
    );

    return response.data;
  }

  async createMovement(
    originDepositId: number,
    destinyDepositId: number,
    sku: string,
    quantity: number
  ) {
    this.client.post(
      `api/inventarios/movimientoInterno?idDepositoOrigen=${originDepositId}&idDepositoDestino=${destinyDepositId}&codigo=${sku}&cantidad=${quantity}`
    );
  }
}

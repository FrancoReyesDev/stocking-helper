import path from "path";
import fs from "fs";
import { Control } from "~/types/Control.type";

export class ControlsRepository {
  private dirname = path.join(import.meta.dirname, "../../assets/controls");
  controls: Control[];

  constructor() {
    const controls = this.getControlsFromDirectory();
    this.controls = controls.sort((a, b) =>
      a.isoStringDate < b.isoStringDate
        ? 1
        : a.isoStringDate === b.isoStringDate
        ? 0
        : -1
    );
  }

  private getControlsFromDirectory() {
    const files = fs.readdirSync(this.dirname);
    const jsonFiles = files.filter((file) => file.endsWith(".json"));
    const jsonObjects: Control[] = [];

    jsonFiles.forEach((file) => {
      const filePath = path.join(this.dirname, file);

      const fileContent = fs.readFileSync(filePath, "utf8");
      try {
        const jsonObject = JSON.parse(fileContent);
        jsonObjects.push(jsonObject);
      } catch (error) {
        console.error(`Error al parsear el archivo ${file}:`, error);
      }
    });

    return jsonObjects;
  }

  getControl(id: string) {
    return this.controls.find((control) => control.id === id);
  }

  deleteControl(id: string) {
    const filename = path.join(this.dirname, id + ".json");

    try {
      fs.rmSync(filename);
    } catch (e) {
      console.error({
        error: e,
        msg: "error al borrar " + id,
        filename: filename,
      });
    }
  }

  saveControl(data: Control) {
    try {
      // Convierte el objeto JavaScript a JSON
      const jsonData = JSON.stringify(data, null, 2); // El `null, 2` agrega formato (espaciado) al JSON

      // Escribe el JSON en el archivo
      fs.writeFileSync(
        path.join(this.dirname, data.id + ".json"),
        jsonData,
        "utf-8"
      );
      console.log(`El archivo JSON ha sido creado en: ${this.dirname}`);
    } catch (error) {
      console.error("Error al crear el archivo JSON:", error);
    }
  }
}

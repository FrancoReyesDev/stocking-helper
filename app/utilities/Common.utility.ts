import _ from "lodash";

export default class CommonUtility {
  static getArrayPermutations<T>(array: T[]) {
    function permutations(array: T[]): T[][] {
      if (array.length <= 1) return [array];

      return array.flatMap((item, index) =>
        permutations(_.without(array, item)).map((perm) => [item, ...perm])
      );
    }

    return permutations(array);
  }

  static getTrimmedObjectFields<T extends Record<string, any>>(obj: T) {
    function trimObjectFields(obj: T): T {
      return _.mapValues(obj, (value) => {
        if (_.isString(value)) {
          return _.trim(value); // Trimea si es una cadena
        } else if (_.isObject(value) && !_.isArray(value)) {
          return trimObjectFields(value); // Recursión para objetos anidados
        }
        return value; // Mantén otros tipos de datos intactos
      }) as T;
    }

    return trimObjectFields(obj);
  }
}

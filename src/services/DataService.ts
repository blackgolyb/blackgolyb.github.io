import config from "../core/config";

class DataService {
  private static instance: DataService;
  private cache: any = null;

  private constructor() {}

  public static getInstance(): DataService {
    if (!DataService.instance) {
      DataService.instance = new DataService();
    }
    return DataService.instance;
  }

  public async fetchCVLink(): Promise<string> {
    const data = await this.fetchData();
    return data.cvLink;
  }

  public async fetchData(): Promise<any> {
    try {
      if (this.cache) {
        return this.cache;
      }

      const response = await fetch(config.dataUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      this.cache = data;
      return data;
    } catch (error) {
      console.error("Error fetching data:", error);
      throw error;
    }
  }
}

export default DataService.getInstance();

import config from "../core/config";

export interface ProfileContact {
  icon: string;
  label: string;
  link: string;
}

export interface ProfileSkillGroup {
  name: string;
  skills: string[];
}

export interface ProfileExperience {
  name: string;
  position: string;
  startDate: string;
  endDate: string | null;
  city: string;
  descriptions: string[];
  technologies: string[];
}

export interface ProfileEducation {
  name: string;
  degree: string;
  major: string;
  startDate: string;
  endDate: string | null;
}

export interface ProfileData {
  firstName: string;
  lastName: string;
  position: string;
  location: {
    city: string;
    country: string;
  };
  dob: string;
  photo: string;
  cvLink: string;
  contacts: ProfileContact[];
  skills: ProfileSkillGroup[];
  experience: ProfileExperience[];
  education: ProfileEducation[];
}

class DataService {
  private static instance: DataService;
  private cache: ProfileData | null = null;

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

  public async fetchData(): Promise<ProfileData> {
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

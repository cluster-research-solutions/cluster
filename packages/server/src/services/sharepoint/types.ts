export interface SharePointSite {
  id: string;
  displayName: string;
  webUrl: string;
  description?: string;
}

export interface SharePointDrive {
  id: string;
  name: string;
  description?: string;
  driveType: string;
  webUrl: string;
}

export interface SharePointItem {
  id: string;
  name: string;
  size?: number;
  webUrl: string;
  createdDateTime: string;
  lastModifiedDateTime: string;
  folder?: {
    childCount: number;
  };
  file?: {
    mimeType: string;
    hashes?: {
      quickXorHash?: string;
      sha1Hash?: string;
    };
  };
  parentReference?: {
    driveId: string;
    id: string;
    path: string;
  };
}

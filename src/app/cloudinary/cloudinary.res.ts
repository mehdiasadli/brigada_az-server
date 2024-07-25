import { UploadApiErrorResponse, UploadApiResponse } from 'cloudinary';

export type FolderNames = 'avatars' | 'post-images';
export type CloudinaryResponse = UploadApiErrorResponse | UploadApiResponse;

export type ImageResponse = {
  asset_id: string;
  public_id: string;
  version: number;
  version_id: string;
  signature: string;
  width: number;
  height: number;
  format: 'jpg' | 'png' | 'jpeg';
  resource_type: 'image';
  created_at: string;
  tags: any[];
  bytes: number;
  type: 'upload';
  etag: string;
  placeholder: boolean;
  url: string;
  secure_url: string;
  asset_folder: FolderNames | '';
  display_name: string;
  original_filename: string;
  api_key: number;
};

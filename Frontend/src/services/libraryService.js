import api from "./api.js";
import { getEffectiveToken } from "./ragService.js";

/**
 * @param {string} [fileType]
 * @param {number} [page]
 * @param {number} [limit]
 */
export async function getLibraryFiles(fileType, page = 1, limit = 20) {
  const token = getEffectiveToken();
  const params = { page, limit };
  if (fileType) params.fileType = fileType;
  const response = await api.get("/library", {
    params,
    headers: {
      Authorization: token ? `Bearer ${token}` : undefined,
    },
  });
  return response.data;
}

export async function deleteLibraryFile(fileId) {
  const token = getEffectiveToken();
  const response = await api.delete(`/library/${fileId}`, {
    headers: {
      Authorization: token ? `Bearer ${token}` : undefined,
    },
  });
  return response.data;
}

export async function getLibraryStats() {
  const token = getEffectiveToken();
  const response = await api.get("/library/stats", {
    headers: {
      Authorization: token ? `Bearer ${token}` : undefined,
    },
  });
  return response.data;
}

import { describe, expect, it } from "vitest";
import { resolveImageApiConnection, validImageApiBaseUrl } from "./image-api-config";

const server = {
  baseUrl: "https://images.example/v1/",
  model: "server-image-model",
  apiKey: "server-secret",
};

describe("campaign-specific image API", () => {
  it("inherits the default endpoint, model and key when not overridden", () => {
    expect(resolveImageApiConnection(server)).toEqual({
      baseUrl: "https://images.example/v1",
      model: "server-image-model",
      apiKey: "server-secret",
    });
  });

  it("lets a campaign use a different model on the shared endpoint", () => {
    expect(resolveImageApiConnection(server, { imageApiModel: "another-model" })).toEqual({
      baseUrl: "https://images.example/v1",
      model: "another-model",
      apiKey: "server-secret",
    });
  });

  it("does not send the server API key to a campaign-specific endpoint", () => {
    expect(resolveImageApiConnection(server, {
      imageApiBaseUrl: "https://custom.example/v1/",
      imageApiModel: "my-image-model",
    })).toEqual({
      baseUrl: "https://custom.example/v1",
      model: "my-image-model",
      apiKey: "",
    });
  });

  it("uses only the campaign image key for its own endpoint", () => {
    expect(resolveImageApiConnection(server, {
      imageApiBaseUrl: "https://custom.example/v1",
      imageApiModel: "my-image-model",
      imageApiKey: "campaign-secret",
    }).apiKey).toBe("campaign-secret");
  });

  it("allows a campaign-specific key without changing the server URL", () => {
    expect(resolveImageApiConnection(server, { imageApiKey: "different-secret" }).apiKey).toBe("different-secret");
  });

  it("rejects URL credentials, query strings and unsupported URL schemes", () => {
    expect(validImageApiBaseUrl("")).toBe(true);
    expect(validImageApiBaseUrl("https://images.example/v1")).toBe(true);
    expect(validImageApiBaseUrl("http://127.0.0.1:8080/v1")).toBe(true);
    expect(validImageApiBaseUrl("https://user:password@images.example/v1")).toBe(false);
    expect(validImageApiBaseUrl("https://images.example/v1?key=secret")).toBe(false);
    expect(validImageApiBaseUrl("file:///tmp/secret")).toBe(false);
    expect(validImageApiBaseUrl("not a URL")).toBe(false);
  });
});

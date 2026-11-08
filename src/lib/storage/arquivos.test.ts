import { describe, expect, it } from "vitest";
import { arquivosSubstituidos, megas, validarVideo, VIDEO_TAMANHO_MAXIMO } from "./arquivos";

describe("validarVideo", () => {
  it("aceita MP4, MOV e WebM dentro do limite, com a extensão certa", () => {
    expect(validarVideo({ type: "video/mp4", size: 1000 })).toEqual({ ok: true, extensao: "mp4" });
    expect(validarVideo({ type: "video/quicktime", size: 1000 })).toEqual({ ok: true, extensao: "mov" });
    expect(validarVideo({ type: "video/webm", size: VIDEO_TAMANHO_MAXIMO })).toEqual({ ok: true, extensao: "webm" });
  });

  it("recusa outros tipos", () => {
    expect(validarVideo({ type: "video/x-msvideo", size: 1000 }).ok).toBe(false);
    expect(validarVideo({ type: "image/png", size: 1000 }).ok).toBe(false);
  });

  it("recusa acima de 50 MB e diz o tamanho do arquivo", () => {
    const r = validarVideo({ type: "video/mp4", size: 80 * 1024 * 1024 });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.erro).toContain("80 MB");
  });
});

describe("megas", () => {
  it("formata em MB no padrão brasileiro", () => {
    expect(megas(VIDEO_TAMANHO_MAXIMO)).toBe("50 MB");
    expect(megas(1.5 * 1024 * 1024)).toBe("1,5 MB");
  });
});

describe("arquivosSubstituidos", () => {
  it("devolve os caminhos que saíram do registro", () => {
    expect(arquivosSubstituidos(["a.webp", "v.mp4"], ["b.webp", "v.mp4"])).toEqual(["a.webp"]);
    expect(arquivosSubstituidos(["a.webp"], [null])).toEqual(["a.webp"]);
  });

  it("ignora vazios e não repete", () => {
    expect(arquivosSubstituidos([null, undefined, ""], ["x"])).toEqual([]);
    expect(arquivosSubstituidos(["a", "a"], [])).toEqual(["a"]);
  });
});

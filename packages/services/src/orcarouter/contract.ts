import { ServiceChannels, type OrcaCapability, type OrcaCredentialSource } from "@zcode/shared";
import { createServiceDescriptor } from "../descriptors.js";
import type { OrcaConnectState } from "./connect.js";
import type { OrcaCredentialStatus } from "./credentialStore.js";
import type {
  OrcaRouterCatalogView,
  OrcaRouterConnectResult,
  OrcaRouterEndpoints,
  OrcaRouterResolvedCredential,
} from "./service.js";

// IOrcaRouterService 的接口与服务描述符同居 browser-safe 模块（与 project/contract 等
// 同一模式）：根 barrel 需要值导出该描述符（client 的 RemoteServiceAccess 读取
// channelName、renderer 以类型位消费），但 service.ts 顶层静态依赖 connect.js
// （node:crypto）——barrel 指向 service.ts 会把整条 node 依赖链拉进 renderer 模块图。
// 本文件对 service.ts 仅存类型位导入（编译期擦除），不进入运行时闭包；
// browserSafeBarrel.test.ts 守卫该约束：根 barrel 的值导出闭包不得触达 node:*。
export interface IOrcaRouterService {
  getEndpoints(): Promise<OrcaRouterEndpoints>;
  getCredentialStatus(): Promise<OrcaCredentialStatus>;
  /** API Key adapter：保存或更新手填密钥 */
  saveApiKey(input: { readonly apiKey: string }): Promise<OrcaCredentialStatus>;
  /** API Key adapter：清除 */
  clearCredential(): Promise<OrcaCredentialStatus>;
  /** 证明两条入口产出同一种凭据结果（下游不关心来源） */
  resolveCredential(input: {
    readonly source: OrcaCredentialSource;
  }): Promise<OrcaRouterResolvedCredential | null>;
  /** PKCE adapter：开始登录，返回用户需要打开的授权 URL */
  beginConnect(): Promise<OrcaConnectState>;
  /** PKCE adapter：提交用户粘贴的授权码 */
  submitConnectCode(input: { readonly code: string }): Promise<OrcaRouterConnectResult>;
  cancelConnect(input?: { readonly reason?: string }): Promise<OrcaConnectState>;
  /** 卸载 / pagehide / 切换认证方式时同步清理登录锁 */
  invalidateConnect(input: {
    readonly reason: "pagehide" | "unmount" | "provider-switch" | "auth-method-switch";
  }): Promise<OrcaConnectState>;
  listModels(input: {
    readonly capability: OrcaCapability;
    readonly requiredInputModality?: "image" | "audio" | "video";
    readonly forceRefresh?: boolean;
  }): Promise<OrcaRouterCatalogView>;
  /** 上游 401：只标记发出被拒请求的精确账号与 generation */
  reportUnauthorized(input: {
    readonly generation?: number;
    readonly accountId?: string;
  }): Promise<{ readonly marked: boolean; readonly status: OrcaCredentialStatus }>;
  /**
   * 把当前 store 凭据对齐到 OrcaRouter provider 的推理配置。
   *
   * 保存/换取/清除/401 都会自动对齐；本方法是启动期的显式兜底，
   * 也是自动化测试验证「凭据确实到达推理路径」的入口。
   */
  reconcileProviderCredential(): Promise<OrcaCredentialStatus>;
}

export const IOrcaRouterService = createServiceDescriptor<IOrcaRouterService>(
  ServiceChannels.OrcaRouter,
);

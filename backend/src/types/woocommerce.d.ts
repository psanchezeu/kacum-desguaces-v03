declare module '@woocommerce/woocommerce-rest-api' {
  export type WooCommerceRestApiVersion = 'wc/v1' | 'wc/v2' | 'wc/v3' | 'wc-api/v1' | 'wc-api/v2' | 'wc-api/v3';

  export interface WooCommerceRestApiOptions {
    url: string;
    consumerKey: string;
    consumerSecret: string;
    version?: WooCommerceRestApiVersion;
    wpAPIPrefix?: string;
    wpAPIVersion?: string;
    queryStringAuth?: boolean;
    encoding?: string;
    axiosConfig?: any;
  }

  export default class WooCommerceRestApi {
    constructor(options: WooCommerceRestApiOptions);
    get(endpoint: string, params?: any): Promise<any>;
    post(endpoint: string, data: any, params?: any): Promise<any>;
    put(endpoint: string, data: any, params?: any): Promise<any>;
    delete(endpoint: string, params?: any): Promise<any>;
    options(endpoint: string, params?: any): Promise<any>;
  }
}

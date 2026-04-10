export interface HoplixProduct {
  'product-code': string;
  name: string;
  colors: string;
  description: string | null;
  sizes: string;
  'base-cost': string;
  'base-cost-back': string;
  'production days': string;
  'printable-area': string;
  orientation: string;
  weight: string;
  preview?: Array<Record<string, string>>;
}

export interface HoplixProductResponse {
  status: number;
  'product-list'?: HoplixProduct[];
  'product-info'?: HoplixProduct;
  'additional-product'?: HoplixProduct[];
  requested?: string;
  message?: string;
}

export interface CampaignProduct {
  'product-code': string;
  'product-color': string;
  'product-price': number;
}

export interface CreateCampaignData {
  name: string;
  description: string;
  url: string;
  private: 'n' | 'y';
  oneshot?: 'on';
  'campaign-duration': string | 0;
  front: string;
  back?: string;
  insidelabel?: string;
  currency: 'EUR';
  'product-code': string;
  'product-color': string;
  'product-price': number;
  'additional-product'?: CampaignProduct[];
}

export interface CreateCampaignResponse {
  status: number;
  campaign_id?: string;
  link?: string;
  message?: string;
}

export interface OrderProduct {
  'campaign-id': string;
  'product-id': string;
  'product-color': string;
  'product-size': string;
  quantity: number;
}

export interface CreateOrderData {
  products: OrderProduct[];
  'shipping-mode': 'economy' | 'tracked' | 'express' | 'fob';
  order_reference?: string;
  'payment-method'?: 'credit-card' | 'wallet';
  'client-email'?: string;
  'shipping-info': {
    name: string;
    surname: string;
    address: string;
    'address-more'?: string;
    'zip-code': string;
    city: string;
    province: string;
    'country-code': string;
  };
}

export interface CreateOrderResponse {
  status: number;
  'order-id'?: string;
  total?: number;
  'shipping-cost'?: number;
  message?: string;
}

export interface OrderStatusResponse {
  status: number;
  'order-status'?: string;
  'shipping-code'?: string;
  'tracking-url'?: string;
  message?: string;
}

export interface OrderInfo {
  'order-id': string;
  'your-order-number': string;
  'order-date': string;
  type: string;
  'order-status': string;
  'shipping-cost': number;
  'shipping-code': string;
  'tracking-url': string;
  'product-order': Array<{
    'campaign-id': string;
    'product-code': string;
    'product-name': string;
    size: string;
    color: string;
    quantity: number;
    'unit-price': number;
    'total-price': number;
  }>;
}

export interface HoplixCampaign {
  id_campaign?: string;
  campaign_id?: string;
  name: string;
  url: string;
  description?: string;
  status?: string;
  'Creation Date'?: string;
  'Initial Date'?: string;
  'End Date'?: string;
  view?: number;
  'campaign products'?: Array<{
    name: string;
    price: string;
    colors: string;
  }>;
}

class HoplixService {
  private apiKey: string | null = null;
  private apiSecret: string | null = null;
  private baseUrl = 'https://api.hoplix.com/v1';
  private initialized = false;

  initialize(apiKey: string, apiSecret: string) {
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.initialized = true;
    console.log('✅ HoplixService initialized');
  }

  isConfigured(): boolean {
    return this.initialized && !!(this.apiKey && this.apiSecret);
  }

  private async request<T>(endpoint: string, data: any = {}, noCache: boolean = false): Promise<T> {
    if (!this.isConfigured()) {
      throw new Error('Hoplix API not configured. Please check your API credentials.');
    }

    const url = `${this.baseUrl}${endpoint}`;
    const payload = JSON.stringify({
      api: this.apiKey,
      secret: this.apiSecret,
      ...data,
    });

    console.log(`📤 POST ${url}`);
    console.log(`📤 Payload keys:`, Object.keys({ api: '***', secret: '***', ...data }));

    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.error(`❌ Request timeout for ${endpoint}`);
      controller.abort();
    }, 30000); // 30 second timeout

    try {
      const fetchOptions: RequestInit = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: payload,
        signal: controller.signal,
      };
      
      if (noCache) {
        fetchOptions.cache = 'no-store';
      }
      
      const response = await fetch(url, fetchOptions);
      clearTimeout(timeoutId);

      const text = await response.text();
      console.log(`📥 Response status: ${response.status}`);
      console.log(`📥 Response body length: ${text.length} chars`);
      
      if (!text || text.trim() === '') {
        console.error('❌ Empty response from API');
        throw new Error('Empty response from API');
      }
      
      let responseData;
      try {
        responseData = JSON.parse(text);
      } catch (parseError) {
        console.error('❌ Failed to parse JSON:', text.substring(0, 200));
        throw new Error('Invalid JSON response from API');
      }
      
      if (responseData.status) {
        console.log('📥 Response status from API:', responseData.status);
        
        if (responseData.status === 201 && responseData.message === 'Authentication required') {
          console.error('❌ Authentication failed. Please check your API Key and Secret Key.');
        }
      } else {
        console.log('📥 Response is direct data (no status wrapper)');
      }
      
      return responseData;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        console.error(`❌ Request timeout for ${endpoint} after 30 seconds`);
        throw new Error(`Request timeout for ${endpoint}`);
      }
      console.error('❌ Network error in request:', error);
      throw error;
    }
  }

  // ==================== PRODUCTS ====================
  
  async getAllProducts(): Promise<HoplixProduct[]> {
    try {
      console.log('🌐 Making API request to /product-list');
      const response = await this.request<any>('/product-list', {});
      
      console.log('📡 Raw response:', JSON.stringify(response).substring(0, 500));
      
      if (response.status === 200 && response['product-list']) {
        console.log(`✅ Found ${response['product-list'].length} products`);
        return response['product-list'];
      }
      
      if (response.message) {
        console.error('API Error:', response.message);
      }
      
      return [];
    } catch (error) {
      console.error('Error in getAllProducts:', error);
      return [];
    }
  }

  async getProduct(productCode: string): Promise<{
    product: HoplixProduct | null;
    additionalProducts: HoplixProduct[];
  }> {
    const response = await this.request<HoplixProductResponse>(`/product-info/${productCode}`, {});
    
    if (response.status === 200 && response['product-info']) {
      return {
        product: response['product-info'],
        additionalProducts: response['additional-product'] || [],
      };
    }
    
    console.error('Failed to fetch product:', response.message);
    return { product: null, additionalProducts: [] };
  }

  // ==================== CAMPAIGNS ====================
  
  async createCampaign(data: CreateCampaignData): Promise<CreateCampaignResponse> {
    const response = await this.request<CreateCampaignResponse>('/create-campaign', {
      campaign: data,
    });
    
    return response;
  }

  async getCampaign(campaignId: string): Promise<any> {
    try {
      console.log(`🔍 Fetching campaign: ${campaignId}`);
      const response = await this.request<any>(`/info-campaign/${campaignId}`, {}, true);
      
      if (response.status === 200 && response.campaign) {
        console.log(`✅ Found campaign: ${response.campaign.name}`);
        return response.campaign;
      }
      
      console.error('Failed to fetch campaign:', response.message);
      return null;
    } catch (error) {
      console.error('Error fetching campaign:', error);
      return null;
    }
  }

  async listCampaigns(): Promise<any[]> {
    try {
      console.log('📋 Listing all campaigns...');
      const response = await this.request<any>('/list-campaign', {});
      
      console.log('📋 Raw campaigns response type:', Array.isArray(response) ? 'Array' : typeof response);
      
      if (Array.isArray(response)) {
        console.log(`✅ Found ${response.length} campaigns`);
        return response;
      }
      
      if (response && typeof response === 'object') {
        if (response.campaigns && Array.isArray(response.campaigns)) {
          console.log(`✅ Found ${response.campaigns.length} campaigns`);
          return response.campaigns;
        }
        if (response.id_campaign || response.campaign_id) {
          console.log(`✅ Found 1 campaign`);
          return [response];
        }
      }
      
      console.log('📋 No campaigns found, returning empty array');
      return [];
    } catch (error) {
      console.error('Error listing campaigns:', error);
      return [];
    }
  }

  // ==================== ORDERS ====================
  
  async createOrder(data: CreateOrderData): Promise<CreateOrderResponse> {
    const response = await this.request<CreateOrderResponse>('/create-order', {
      order: data,
    });
    
    return response;
  }

  async createCampaignAndOrder(data: {
    products: Array<{
      'product-code': string;
      front: string;
      back?: string;
      insidelabel?: string;
      'product-color': string;
      'product-size': string;
      quantity: number;
      oneshot?: 'on';
    }>;
    'shipping-mode': 'economy' | 'tracked' | 'express' | 'fob';
    order_reference?: string;
    'payment-method'?: 'credit-card' | 'wallet';
    'shipping-info': CreateOrderData['shipping-info'];
  }): Promise<CreateOrderResponse> {
    const response = await this.request<CreateOrderResponse>('/create-campaign-order', {
      order: data,
    });
    
    return response;
  }

  async getOrderStatus(orderId: string): Promise<OrderStatusResponse> {
    const response = await this.request<OrderStatusResponse>(`/status-order/${orderId}`, {});
    return response;
  }

  async getOrderStatusByReference(orderRef: string): Promise<OrderStatusResponse> {
    const response = await this.request<OrderStatusResponse>('/status-order-reference', {
      'order-ref': orderRef,
    });
    return response;
  }

  async getOrderInfo(orderId: string): Promise<{ status: number; 'order-info'?: OrderInfo; message?: string }> {
    const response = await this.request<any>(`/order-info/${orderId}`, {});
    return response;
  }

  async listOrders(): Promise<Array<{
    'order-id': string;
    'order-status': string;
    'shipping-code': string;
    'tracking-url': string;
  }>> {
    const response = await this.request<any>('/list-orders', {});
    
    if (response.status === 200 && response['order-list']) {
      return response['order-list'];
    }
    
    return [];
  }

  async cancelOrder(orderId: string): Promise<{ status: number; message?: string }> {
    const response = await this.request<any>(`/cancel-order/${orderId}`, {});
    return response;
  }

  async getOrderStatusList(): Promise<Array<{ status: string; meaning: string }>> {
    const response = await this.request<any>('/status-order-list', {});
    
    if (Array.isArray(response)) {
      return response;
    }
    
    return [];
  }
}

export const hoplixService = new HoplixService();
export type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";

export type Order = {
  id: string;
  customerName: string;
  phone: string;
  address: string;
  size: string;
  quantity: number;
  zone: "inside" | "outside";
  total: number;
  status: OrderStatus;
  createdAt: string; // ISO date
};

// ── Server Order Status & Area Enums ──
export type TOrderStatus = "pending" | "confirm" | "onWay" | "delivered" | "return" | "cancel";
export type TDeliveryArea = "insideDhaka" | "outsideDhaka";

// ── Customer order tracking (GET /api/order/my-orders/:mobileNumber) ──
export type TrackedOrderStatus = TOrderStatus;

export type TrackedOrder = {
  _id: string;
  orderId: string;
  userName: string;
  mobileNumber: string;
  email?: string;
  price: number;
  qty: number;
  productColors?: string[];
  deliveryArea: TDeliveryArea;
  deliveryCharged?: number;
  totalPrice?: number;
  deliveryAddress: string;
  orderStatus: TrackedOrderStatus;
  isReviewed?: boolean;
  review?: { rating?: number; comment?: string; status?: TReviewStatus } | null;
  createdAt: string; // ISO date
  updatedAt: string;
};

// ── Admin Order Model matching reselling-server IOrder ──
export interface IOrder {
  _id: string;
  orderId: string;
  userName: string;
  mobileNumber: string;
  email?: string;
  price: number;
  qty: number;
  productColors: string[];
  deliveryArea: TDeliveryArea;
  deliveryCharged?: number;
  deliveryCharge?: number;
  totalPrice?: number;
  deliveryAddress: string;
  orderStatus: TOrderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
}

export interface AdminOrdersQuery {
  page?: number;
  limit?: number;
  search?: string;
  orderStatus?: string;
  deliveryArea?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface AdminOrdersResponse {
  orders: IOrder[];
  meta: PaginationMeta;
}

// ── Reviews ──
export type TReviewStatus = "pending" | "published" | "rejected";

// GET /api/review (published only, public)
export interface PublicReview {
  _id: string;
  customerName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

// GET /api/review/stats
export interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  ratingBreakdown: Record<"1" | "2" | "3" | "4" | "5", number>;
}

// GET /api/review/admin
export interface AdminReview {
  _id: string;
  orderId?: string;
  customerName: string;
  mobileNumber: string;
  rating: number;
  comment: string;
  status: TReviewStatus;
  createdAt: string;
  updatedAt?: string;
}

export interface AdminReviewsQuery {
  page?: number;
  limit?: number;
  status?: TReviewStatus | "";
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

import { CartItem } from "../cartItems/cartItemsTypes";
import { User } from "../users/usersTypes";

export interface Cart {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  cart_items?: CartItem[];
  user?: User;
}

export interface CreateCart {
  user_id: string;
}

export interface UpdateCart {
  id: string;
  user_id?: string;
}
import { config } from "@/config";
import { IOrder } from "@/interface/order/order.interface";
import mongoose, { Schema } from "mongoose";
import uniqueId from "order-id";
import encrypt from "mongoose-encryption";
import { OrderPaymentMethods, OrderPaymentStatus, ReturnOrderStatus } from "@/constants";

const OrderSchema = new Schema<IOrder>({
  userId: {
    type: String,
    ref: "User",
    required: true
  },
  orderId: {
    type: String,
    required: true,
    unique: true,
    default: function () {
      const id = uniqueId(config.CRYTPO_SECRET).generate();
      return id.replace(/-/g, "");
    }
  },
  orderItems: [{
    productId: {
      type: String,
      ref: "Product",
      required: true
    },
    vendorId: {
      type: String,
      ref: "Vendors",
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    payout: {
      type: Number,
      default: 0
    },
    commisionAmount: {
      type: Number
    },
    variant: {
      type: String,
      default: null
    },
    image: {
      type: String,
      default: null
    },
    productName: {
      type: String,
      required: true
    },
    sku: {
      type: String,
      required: true
    },
    userId: {
      type: String,
      required: true
    },
    itemStatus: {
      type: String,
      enum: ["processing", "shipped", "delivered", "cancelled", "returned"],
      default: "processing"
    },
    cancelReason: {
      type: String,
      default: null
    },

    returnStatus: {
      type: String,
      enum: ReturnOrderStatus,
      default: "none"
    },
    returnReason: {
      type: String,
      default: null
    },
    returnComment: {
      type: String,
      default: null
    },
    returnRequestedAt: {
      type: Date,
      default: null
    },
    returnApprovedAt: {
      type: Date,
      default: null
    },
    returnRejectedAt: {
      type: Date,
      default: null
    }
  }],

  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  discount: {
    type: Number,
    default: 0
  },
  shippingCost: {
    type: Number,
    default: 0
  },
  tax: {
    type: Number,
    default: 0
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  couponApplied: {
    type: Boolean,
    default: false
  },
  couponCode: {
    type: String,
    default: null
  },
  couponDiscount: {
    type: Number,
    default: 0
  },
  shippingAddress: {
    street: {
      type: String,
      required: true,
      encrypted: true
    },
    city: {
      type: String,
      required: true,
      encrypted: true
    },
    state: {
      type: String,
      required: true,
      encrypted: true
    },
    district: {
      type: String,
      required: true,
      encrypted: true
    },
    country: {
      type: String,
      required: true,
      encrypted: true
    },
    type: {
      type: String,
      required: true,
      encrypted: true
    },
    landmark: {
      type: String,
      encrypted: true
    },
    pincode: {
      type: String,
      required: true,
      encrypted: true
    },
    phone: {
      type: String,
      default: null,
      encrypted: true
    },
    name: {
      type: String,
      default: null,
      encrypted: true
    }
  },
  paymentMethod: {
    type: String,
    enum: OrderPaymentMethods,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: OrderPaymentStatus,
    default: OrderPaymentStatus.PENDING
  },
  paymentId: {
    type: String,
    default: null,
    encrypted: true
  },
  status: {
    type: String,
    enum: ["processing", "shipped", "delivered", "cancelled", "returned"],
    default: "processing"
  },
  orderedDate: {
    type: Date,
    default: Date.now
  },
  invoiceDate: {
    type: Date,
    default: Date.now
  },
  shippedDate: {
    type: Date,
    default: null
  },
  deliveredDate: {
    type: Date,
    default: null
  },
  commision: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const sigKey = config.SIGN_KEY;
const encKey = config.CRYTPO_SECRET;

OrderSchema.plugin(encrypt, {
  encryptionKey: encKey,
  signingKey: sigKey,
  encryptedFields: [
    "shippingAddress.street",
    "shippingAddress.city",
    "shippingAddress.state",
    "shippingAddress.district",
    "shippingAddress.country",
    "shippingAddress.type",
    "shippingAddress.landmark",
    "shippingAddress.pincode",
    "shippingAddress.phone",
    "shippingAddress.name",
    "paymentId"
  ]
});

OrderSchema.index({ userId: 1, orderedDate: -1 });

export const Order = mongoose.model<IOrder>("Order", OrderSchema);

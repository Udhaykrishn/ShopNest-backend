import { IWishlist } from "@/interface";
import { IWishlistRepository } from "../interface/wishlist.repository";
import { Wishlist } from "@/models/wishlist/wishlist.model";
import { PaginationResponse } from "@/types";

export class WishlistRepository implements IWishlistRepository<IWishlist> {
  async createWishlist(userId: string): Promise<IWishlist | null> {
    return await Wishlist.create({ userId, products: [] });
  }

  async findWishlistByUserId(userId: string, skip: number, limit: number): Promise<PaginationResponse<IWishlist> | null> {
    const data = await Wishlist.aggregate([
      {
        $match: { userId }
      },
      {
        $project: {
          products: 1
        }
      },
      {
        $unwind: "$products"
      },
      {
        $lookup: {
          from: "products",
          let: { productIdStr: "$products.productId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", { $toObjectId: "$$productIdStr" }]
                }
              }
            },
            {
              $project: {
                name: 1,
                images: { $arrayElemAt: ["$images", 0] },
                _id: 1,
                variants: 1
              }
            }
          ],
          as: "products.productId"
        }
      },
      {
        $unwind: {
          path: "$products.productId",
          preserveNullAndEmptyArrays: true
        }
      },
      { $skip: skip },
      { $limit: limit },
      {
        $group: {
          _id: "$_id",
          userId: { $first: "$userId" },
          products: {
            $push: {
              productId: "$products.productId",
            }
          }
        }
      },

    ]);

    const total = await Wishlist.aggregate([
      {
        $match: { userId },
      },
      {
        $project: {
          "total": { $size: "$products" },
          _id: 0
        }
      }
    ])


    return {
      data: data[0] || null,
      total: total[0].total
    };

  }

  async addToWishlist(userId: string, productId: string): Promise<IWishlist | null> {
    return await Wishlist.findOneAndUpdate(
      { userId },
      {
        $addToSet: { products: { productId } },
        $set: { updatedAt: new Date() }
      },
      {
        upsert: true,
        new: true,
      },
    )
  }

  async removeFromWishlist(userId: string, productId: string): Promise<IWishlist | null> {
    return await Wishlist.findOneAndUpdate(
      { userId },
      {
        $pull: { products: { productId } },
        $set: { updatedAt: new Date() }
      },
      { new: true }
    ).populate("products");
  }

  async findItembyProductId(userId: string, productId: string): Promise<IWishlist | null> {
    return await Wishlist.findOne({
      userId,
      "products.productId": productId
    })
  }
}
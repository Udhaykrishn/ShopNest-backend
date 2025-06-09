import { inject, injectable } from "inversify";
import { IProductsRepository } from "../interface/product.repo.interface";
import { IProduct, } from "@/interface/product.interface";
import { Product, Product as productModel,ProductDoucment } from "@/models/vendors/implements"
import { Types } from "mongoose";
import { PaginationResponse, VARIANT } from "@/types"
import { IVariantValue } from "@/models/vendors/interface";
import { IVariantRepository } from "@/repository/vendor/interface";
import { BaseRepository } from "@/repository/base.repository";

@injectable()
export class ProductsRepository extends BaseRepository<ProductDoucment> implements IProductsRepository   {
    constructor(
        @inject(VARIANT.VariantRepository) private readonly variantRepository: IVariantRepository
    ) {
        super(productModel);
    }
    async findAllProducts(query: Record<string, unknown>, sort: any, limit: 1, skip: number): Promise<PaginationResponse<IProduct>> {
        try {

            const total = await productModel.countDocuments(query)

            const products = await productModel.aggregate([
                { $match: query },

                {
                    $lookup: {
                        from: "categories",
                        localField: "category",
                        foreignField: "name",
                        as: "categoryDetails"
                    }
                },
                {
                    $unwind: {
                        path: "$categoryDetails",
                        preserveNullAndEmptyArrays: true
                    }
                },

                {
                    $lookup: {
                        from: "variants",
                        localField: "variants",
                        foreignField: "_id",
                        as: "variants"
                    }
                },

                {
                    $lookup: {
                        from: "vendors",
                        localField: "vendorId",
                        foreignField: "_id",
                        as: "vendorId"
                    }
                },
                {
                    $unwind: {
                        path: "$vendorId",
                        preserveNullAndEmptyArrays: true
                    }
                },

                {
                    $match: {
                        $or: [
                            { status: "pending" },

                            { status: "rejected" },

                            {
                                status: "approved",
                                "categoryDetails.isBlocked": { $ne: true },
                                isBlocked: { $ne: true }
                            }
                        ]
                    }
                },
                {
                    $project: {
                        categoryDetails: 0,
                        "vendorId.password": 0,
                        "vendorId.address": 0,
                        "vendorId.createdAt": 0,
                        "vendorId.isBlocked": 0,
                        "vendorId.updatedAt": 0,
                        "vendorId.__v": 0,
                        "vendorId.order": 0,
                        "vendorId.wallet": 0,
                        "vendorId.products": 0,
                        "vendorId.role": 0,
                        "vendorId.isRejected": 0,
                        "vendorId.isApproved": 0
                    }
                },

                { $sort: sort },
                { $skip: skip },
                { $limit: limit }
            ]);


            return {
                data: products,
                total
            }

        } catch (error) {
            console.error("Error fetching products:", error);
            throw new Error("Failed to fetch products");
        }
    }

    async findProductById(id: string): Promise<IProduct | null> {
        return await productModel.findById(id)
            .populate('variants', '_id type values productId')
            .populate('vendorId', '_id username email phone approvalStatus')
            .select('-__v')
            .lean();
    }

    async getProductById(id: string): Promise<IProduct | null> {
        try {
            const product = await Product.findById(id)
                .populate("variants", "_id type values")
                .populate("vendorId", "phone email username isActive")
                .select(
                    "_id name brand description images category subcategory isBlocked createdAt isApproved vendorId price"
                )
                .lean();
            return product || null;
        } catch (error) {
            return null;
        }
    }


    async findProductsByCategory(
        query: Record<string, unknown>,
        sort: any,
        limit: number,
        skip: number
    ): Promise<PaginationResponse<IProduct>> {
        try {
            const aggreatedProducts = await Product.aggregate([
                {
                    $match: query,
                },
                {
                    $lookup: {
                        from: "categories",
                        localField: "category",
                        foreignField: "name",
                        as: "categoryInfo"
                    }
                },
                {
                    $match: { "categoryInfo.isBlocked": false }
                },
                {
                    $project: { categoryInfo: 0, __v: 0, vendorId: 0 }
                },
                {
                    $sort: sort,
                },
                {
                    $skip: skip,
                }, {
                    $limit: limit
                }
            ])

            const products = await Product.populate(aggreatedProducts, {
                path: "variants",
                select: "_id type values productId"
            })

            return { data: products, total: 10 }
        } catch (error) {
            throw new Error("Failed to fetch products by category");
        }
    }

    async getProductByVendor(id: string): Promise<IProduct[] | null> {
        const products = await Product.aggregate([
            { $match: { vendorId: new Types.ObjectId(id) } },
            { $lookup: { from: "variants", localField: "variants", foreignField: "_id", as: "variants" } },
            {
                $project: {
                    _id: 1, name: 1, brand: 1, description: 1, images: 1, status: 1,
                    category: 1, subcategory: 1, isBlocked: 1, createdAt: 1,
                    isApproved: 1, vendorId: 1, price: 1,
                    variants: { _id: 1, type: 1, values: 1 }
                }
            }
        ]);

        return products.length ? products : null;
    }

    async findProductBySKU(sku: string): Promise<IProduct | null> {
        const variant = await this.variantRepository.findVariant(sku);
        const product = await productModel.findById(variant?.id)

        return product;
    }

    async findProductWithSKU(sku: string): Promise<IVariantValue | null> {
        const variant = await this.variantRepository.findVariant(sku)
        const variantDoc = variant?.values.find(data => data.sku === sku) ?? null;
        return variantDoc;
    }
}

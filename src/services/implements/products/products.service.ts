import { inject, injectable } from "inversify";
import { IProductsService } from "@/services/interface";
import { ApprovalStatus, IProduct } from "@/interface/product.interface";
import { IProductsRepository } from "@/repository/products/interface/product.repo.interface";
import { ErrorMessages } from "@/constants/error.constant";
import { IVariant, IVariantValue, IVendor } from "@/models/vendors/interface";
import { errorResponse, validateExists } from "@/utils";
import { v4 as uuidv4 } from "uuid";
import { PaginationResponse, PRODUCT, VARIANT } from "@/types";
import { IVariantRepository } from "@/repository/vendor/interface";
import { CreateProductDTO } from "@/dtos/vendor/product.dto";
import { Types } from "mongoose";
import { STOCK_MAX_LIMIT_PER_ORDER, STOCK_MIN_LIMIT_PER_ORDER } from "@/constants/stock.constant";
import { Variant } from "@/models/vendors/implements";
import { HttpStatusCode } from "axios";

interface IVariantData {
    type: string;
    values: IVariantValue[];
    productId: Types.ObjectId | string;
}

@injectable()
export class ProductsService implements IProductsService {
    constructor(
        @inject(PRODUCT.ProductRepository)
        private readonly productsRepository: IProductsRepository,
        @inject(VARIANT.VariantRepository) private readonly variantRepo: IVariantRepository
    ) {}

    async getAllProducts({
        page,
        limit,
        minPrice,
        maxPrice,
        sortBy,
        search,
        status,
        subcategory
    }: {
        page: number;
        limit: number;
        minPrice?: number;
        maxPrice?: number;
        sortBy?: string;
        search?: string;
        status?: ApprovalStatus | undefined;
        subcategory?: string;
    }): Promise<PaginationResponse<IProduct>> {
        try {
            const query: any = {};

            if (minPrice !== undefined) query.price = { $gte: minPrice };
            if (maxPrice !== undefined) query.price = { ...query.price, $lte: maxPrice };
            if (status !== undefined) query.status = status;

            if (search?.trim()) {
                const cleanSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const regex = { $regex: cleanSearch, $options: "i" };
                query.$or = [
                    { name: regex },
                    { description: regex },
                    { brand: regex },
                ];
            }

            if (subcategory !== undefined) {
                query.subcategory = { subcategory };
            }
            const sort: any = sortBy ? { [sortBy]: 1 } : { createdAt: -1 };
            const skip = (page - 1) * limit;

            return await this.productsRepository.findAllProducts(query, sort, limit, skip);
        } catch (error: any) {
            throw errorResponse(error.message);
        }
    }

    private async generateUniqueSKU(productName: string, variantType: string): Promise<string | null> {
        let sku;
        let exists = true;
        while (exists) {
            const shortName = productName.replace(/\s+/g, "").substring(0, 4).toUpperCase();
            const variantsShort = variantType.substring(0, 3).toUpperCase();
            const uniqueId = uuidv4().split("-")[0].toUpperCase();

            sku = `${shortName}-${variantsShort}-${uniqueId}`;

            console.log("sku is: ", sku);
            const skuExists = await this.variantRepo.findVariant(sku);
            if (!skuExists) {
                exists = false;
            }
        }

        return sku as string;
    }

    async approve(id: string): Promise<IProduct | null> {
        return await this.productsRepository.update(id, {
            status: ApprovalStatus.APPROVED
        });
    }

    async reject(id: string): Promise<IProduct | null> {
        return await this.productsRepository.update(id, { status: ApprovalStatus.REJECTED });
    }

    async getProductById(id: string): Promise<IProduct> {
        try {
            const product = await this.productsRepository.findProductById(id);
            const validatedProduct = validateExists(product, ErrorMessages.PRODUCT_NOT_FOUND);
            return validatedProduct;
        } catch (error: any) {
            console.error(`Error fetching product by ID (${id}):`, error);
            throw errorResponse(error.message);
        }
    }

    async getProductByCategory({
        page,
        limit,
        category,
        search,
        subcategory,
        minPrice,
        maxPrice,
        sortBy
    }: {
        page: number;
        limit: number;
        category: string;
        search: string;
        subcategory: string;
        minPrice: number;
        maxPrice: number;
        sortBy: string;
    }): Promise<PaginationResponse<IProduct>> {
        try {
            if (!category && !subcategory) {
                // Note: This block is incomplete in the original code; consider adding validation
                throw errorResponse("Category or subcategory is required.", HttpStatusCode.BadRequest);
            }

            const query: any = {
                status: ApprovalStatus.APPROVED,
                isBlocked: false,
            };

            if (subcategory) {
                query.subcategory = this.getRegex(subcategory);
            } else {
                query.category = this.getRegex(category);
            }

            if (search) {
                query.$or = [
                    { name: this.getRegex(search) },
                    { brand: this.getRegex(search) }
                ];
            }

            if (minPrice !== undefined || maxPrice !== undefined) {
                query["variants.values.offeredPrice"] = {};
                if (minPrice !== undefined) {
                    query["variants.values.offeredPrice"].$gte = minPrice;
                }
                if (maxPrice !== undefined) {
                    query["variants.values.offeredPrice"].$lte = maxPrice;
                }
            }

            let sort: any = { createdAt: -1 };
            if (sortBy) {
                switch (sortBy) {
                    case "price-asc":
                        sort = { "variants.values.price": 1 };
                        break;
                    case "price-desc":
                        sort = { "variants.values.price": -1 };
                        break;
                    case "newest":
                        sort = { createdAt: -1 };
                        break;
                    default:
                        sort = { createdAt: -1 };
                }
            }

            const skip = (page - 1) * limit;

            return await this.productsRepository.findProductsByCategory(query, sort, limit, skip);
        } catch (error: any) {
            console.error(`Error fetching products by category (${category}):`, error);
            throw errorResponse(error.message);
        }
    }

    private getRegex(value: string) {
        return { $regex: new RegExp(value, "i") };
    }

    async checkProductQuantity(productId: string, variantType: string, variantValue: string, quantity: number): Promise<boolean> {
        try {
            const product = await this.productsRepository.findProductById(productId);
            const validatedProduct = validateExists(product, ErrorMessages.PRODUCT_NOT_FOUND);

            const variants = validatedProduct.variants as IVariant[];
            const targetVariant = variants.find(variant => variant.type === variantType);
            const validatedVariant = validateExists(targetVariant, ErrorMessages.PRODUCT_INVALID_VARIANT_DATA);

            const targetValue = validatedVariant.values.find(value => value.value === variantValue);
            const validatedValue = validateExists(targetValue, ErrorMessages.PRODUCT_INVALID_VARIANT_DATA);

            if (validatedValue.stock < quantity) {
                throw new Error(ErrorMessages.PRODUCT_NOT_ENOUGH_STOCK);
            }

            return true;
        } catch (error: any) {
            console.error(`Error checking product quantity (${productId}):`, error);
            throw errorResponse(error.message);
        }
    }

    async createProduct(id: string, data: CreateProductDTO): Promise<IProduct> {
        try {
            const exists = await this.productsRepository.findOne({
                name: data.name,
                vendorId: id,
            });
            if (exists) {
                throw errorResponse(ErrorMessages.PRODUCT_DUPLICATE_NAME, HttpStatusCode.BadRequest);
            }

            if (!data.images || data.images.length < 3) {
                throw errorResponse(ErrorMessages.PRODUCT_IMAGES_REQUIRED, HttpStatusCode.BadRequest);
            }

            const productId = new Types.ObjectId();

            const variantIds: string[] = [];
            if (data.variants && data.variants.length > 0) {
                const variantPromises = data.variants.map(async (variantDto) => {
                    const valuesWithSkus = await Promise.all(
                        variantDto.values.map(async (val) => {
                            const sku = await this.generateUniqueSKU(data.name, val.value) as string;
                            return {
                                value: val.value,
                                offeredPrice: val.offeredPrice,
                                price: val.price,
                                stock: val.stock,
                                sku,
                            };
                        })
                    );

                    const variant: IVariantData = {
                        type: variantDto.type,
                        values: valuesWithSkus,
                        productId: productId.toString(),
                    };

                    this.validateVariant(variant);
                    const createdVariant = await this.variantRepo.create(variant as IVariant);
                    return createdVariant._id.toString();
                });
                variantIds.push(...(await Promise.all(variantPromises)));
            } else {
                throw errorResponse(ErrorMessages.PRODUCT_VARIANT_REQUIRED, HttpStatusCode.BadRequest);
            }

            const images = data.images.map(img => img.url);

            const sanitizedData = {
                _id:productId.toString(),
                name: data.name,
                brand: data.brand,
                description: data.description,
                images,     
                id,
                category: data.category,
                subcategory: data.subcategory || "",
                variants: variantIds,
                vendorId: id,
                isBlocked: false,
            };

            const createdProduct = await this.productsRepository.create(sanitizedData as IProduct);
            return createdProduct;
        } catch (error: any) {
            throw errorResponse(error.message || "Failed to create product.", error.statusCode || HttpStatusCode.InternalServerError);
        }
    }

    private validateVariant(variant: IVariantData): void {
        const typeSet = new Set<string>();
        const valueSet = new Set<string>();

        if (!variant.type || !variant.type.trim()) {
            throw errorResponse(ErrorMessages.PRODUCT_VARIANT_TYPE_REQUIRED, HttpStatusCode.BadRequest);
        }
        if (typeSet.has(variant.type)) {
            throw errorResponse(`Duplicate variant type "${variant.type}" found. Variant types must be unique.`, HttpStatusCode.BadRequest);
        }
        typeSet.add(variant.type);

        if (!variant.values || variant.values.length === 0) {
            throw errorResponse(`Variant "${variant.type}" must have at least one value.`, HttpStatusCode.BadRequest);
        }

        for (const val of variant.values) {
            if (!val.value || !val.value.trim()) {
                throw errorResponse(`Value for variant "${variant.type}" is required.`, HttpStatusCode.BadRequest);
            }
            if (valueSet.has(val.value)) {
                throw errorResponse(`Duplicate value "${val.value}" found in variant "${variant.type}". Values must be unique within each variant type.`, HttpStatusCode.BadRequest);
            }
            valueSet.add(val.value);

            if (typeof val.price !== "number" || val.price < 0) {
                throw errorResponse(`Price for value "${val.value}" in variant "${variant.type}" must be a non-negative number.`, HttpStatusCode.BadRequest);
            }
            if (typeof val.stock !== "number" || val.stock < 0) {
                throw errorResponse(`Stock for value "${val.value}" in variant "${variant.type}" must be a non-negative number.`, HttpStatusCode.BadRequest);
            }
        }
    }

    private async getProductOrThrow(id: string): Promise<IProduct> {
        const product = await this.productsRepository.getProductById(id);
        return validateExists(product, ErrorMessages.PRODUCT_NOT_FOUND);
    }

    async updateProduct(id: string, productData: Partial<IProduct>): Promise<IProduct> {
        try {
            const product = await this.getProductOrThrow(id);
            const vendor: IVendor = product.vendorId as IVendor;

            if (productData.name && productData.name !== product.name) {
                const duplicate = await this.productsRepository.findOne({
                    name: productData.name,
                    vendorId: vendor._id.toString(),
                });

                if (duplicate && duplicate._id.toString() !== id) {
                    throw errorResponse(ErrorMessages.PRODUCT_DUPLICATE_NAME, HttpStatusCode.BadRequest);
                }
            }

            if (productData.images && productData.images.length < 3) {
                throw errorResponse(ErrorMessages.PRODUCT_IMAGES_REQUIRED, HttpStatusCode.BadRequest);
            }

            if (productData.variants && productData.variants.length === 0) {
                throw errorResponse(ErrorMessages.PRODUCT_VARIANT_REQUIRED, HttpStatusCode.BadRequest);
            }

            let variantIds: Types.ObjectId[] = [];
            if (productData.variants) {
                if (productData.variants.length === 0) {
                    throw errorResponse(ErrorMessages.PRODUCT_VARIANT_REQUIRED, HttpStatusCode.BadRequest);
                }

                for (const variantData of productData.variants as any[]) {
                    const { type, values } = variantData;

                    if (!type || !values || !Array.isArray(values) || values.length === 0) {
                        throw errorResponse(ErrorMessages.PRODUCT_INVALID_VARIANT_DATA, HttpStatusCode.BadRequest);
                    }

                    const updatedValues = await Promise.all(
                        values.map(async (value: any) => {
                            if (!value.sku) {
                                const sku = await this.generateUniqueSKU(productData.name || product.name, type);
                                return { ...value, sku };
                            }
                            return value;
                        })
                    );

                    const variant = await Variant.findOneAndUpdate(
                        {
                            type,
                            productId: new Types.ObjectId(id),
                        },
                        {
                            type,
                            values: updatedValues,
                            productId: new Types.ObjectId(id),
                        },
                        {
                            upsert: true,
                            new: true,
                            runValidators: true,
                        }
                    );

                    variantIds.push(new Types.ObjectId(variant._id));
                }

                productData.variants = variantIds as any;
            }

            const updatedProduct = await this.productsRepository.update(id, productData);
            const validatedUpdatedProduct = validateExists(updatedProduct, ErrorMessages.PRODUCT_NOT_FOUND);

            console.log("updated product is: ", validatedUpdatedProduct);
            return validatedUpdatedProduct;
        } catch (error: any) {
            if (error.code === 11000) {
                throw errorResponse(ErrorMessages.PRODUCT_ALREADY_EXISTS, HttpStatusCode.Conflict);
            }

            throw errorResponse(error.message || "Failed to update product.", error.statusCode || HttpStatusCode.InternalServerError);
        }
    }

    async blockProduct(id: string): Promise<IProduct> {
        try {
            const product = await this.getProductOrThrow(id);
            if (product.isBlocked) {
                throw errorResponse(ErrorMessages.PRODUCT_IS_BLOCKED, HttpStatusCode.BadRequest);
            }
            const blockedProduct = await this.productsRepository.update(id,{isBlocked:true});
            return validateExists(blockedProduct, ErrorMessages.PRODUCT_NOT_FOUND);
        } catch (error: any) {
            throw errorResponse(error.message || ErrorMessages.FAILED_PRODUCT_BLOCK , error.statusCode || HttpStatusCode.InternalServerError);
        }
    }

    async unblockProduct(id: string): Promise<IProduct> {
        try {
            const product = await this.getProductOrThrow(id);
            if (!product.isBlocked) {
                throw errorResponse("Product is already active.", 400);
            }
            const unblockedProduct = await this.productsRepository.update(id,{isBlocked:false});
            return validateExists(unblockedProduct, ErrorMessages.PRODUCT_NOT_FOUND);
        } catch (error: any) {
            throw errorResponse(error.message || "Failed to unblock product.", error.statusCode || 500);
        }
    }

    async getProductByVendor(id: string): Promise<IProduct[]> {
        try {
            if (!id) {
                throw errorResponse("Vendor ID is required.", 400);
            }
            const products = await this.productsRepository.getProductByVendor(id);
            const validatedProducts = validateExists(products, ErrorMessages.PRODUCT_NOT_FOUND);
            if (validatedProducts.length === 0) {
                throw errorResponse("No products found for this vendor.", 404);
            }
            return validatedProducts;
        } catch (error: any) {
            throw errorResponse(error.message || "Failed to retrieve vendor products.", error.statusCode || 500);
        }
    }

    async stockCheck(
        id: string,
        sku: string,
        action: 'add' | 'reduce',
        quantity: number
    ): Promise<number> {
        try {
            const SKU = await this.productsRepository.findProductWithSKU(sku);
            const validatedSKU = validateExists(SKU, ErrorMessages.PRODUCT_NOT_FOUND);

            const currentStock = validatedSKU.stock;

            if (action === 'reduce') {
                quantity--;
                if (quantity > currentStock) {
                    throw new Error("Not enough stock available");
                }
                if (quantity <= STOCK_MIN_LIMIT_PER_ORDER) {
                    throw new Error("Stock would fall below the minimum limit");
                }
            }

            if (action === 'add') {
                if (quantity > currentStock) {
                    throw new Error("Not enough stock available to add this quantity");
                }

                if (quantity >= STOCK_MAX_LIMIT_PER_ORDER) {
                    throw new Error(`You can't add more than ${STOCK_MAX_LIMIT_PER_ORDER} units per order`);
                }

                quantity++;
            }

            return quantity;
        } catch (error: any) {
            throw new Error(error.message);
        }
    }
}
export const PRODUCT = {
    ProductController: Symbol.for("ProductController"),
    ProductService: Symbol.for("ProductService"),
    ProductRepository: Symbol.for("ProductRepository")
}

export interface IProductFilter{
    search?:string;
    minPrice?:number;
    maxPrice?:number;
    category?:string;
    brand?:string;
    isActive:boolean;
}

export interface IPaginationOptions{
    page:number;
    limit:number;
    sortBy?:string;
    sortOrder?:"asc" | "des"
}

export interface IPaginatedResponse<T>{
    items:T[];
    total:number;
    page:number;
    limit:number;
    totalPages:number;
}
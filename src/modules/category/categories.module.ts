
import { CategorysController } from '@/controllers/category/categorys.controller';
import { CategoryRepository } from '@/repository/category/implement/category.repository';
import { CategoryServices } from '@/services/implements/categorys/category.service';
import { CATEGORY } from '@/types';
import { ContainerModule } from 'inversify';

export const CategoriesModule = new ContainerModule((bind) => {
    bind<CategorysController>(CATEGORY.categoryController).to(CategorysController);
    bind<CategoryServices>(CATEGORY.categoryServices).to(CategoryServices);
    bind<CategoryRepository>(CATEGORY.categoryRepository).to(CategoryRepository)
})
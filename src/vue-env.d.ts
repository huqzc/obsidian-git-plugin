
// 声明 `*.vue` 模块. 这将允许在 `*.ts` 文件中导入 `*.vue` 模块.
declare module "*.vue" {
    import type {DefineComponent} from "vue";
    const component: DefineComponent<{}, {}, any>;
    export default component;
}

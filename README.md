# 森林消消乐

纯 HTML / CSS / JavaScript 静态游戏，无需安装依赖或 build。此包是可上传 GitHub 的前端源码，不包含原应用配置、云端数据库或后端部署文件。

## 本地启动

在此目录打开终端，执行：

```sh
python -m http.server 8000 --bind 127.0.0.1
```

浏览器打开 http://127.0.0.1:8000/ 。Windows 如使用 Python 启动器，也可执行 `py -m http.server 8000 --bind 127.0.0.1`。

单人运行文件均在本地，使用系统字体和内联/本地 SVG；启动本地服务器后无需互联网。默认不会加载云 SDK 或访问云服务。建议使用现代 Chrome、Edge 或 Firefox，并保持此本地地址以保留浏览器存档。

## 功能与边界

- 单人 9×9 三消：19 步收集 57 冰棒的示范规则，蜜罐、直线特效、魔力鸟及组合消除、连锁动画与音效开关。
- 五种道具：洗牌、撤销、强制交换、木槌、增加步数。
- 冒险地图、逐关解锁和星级记录，使用 localStorage 保存本机进度。后续编号复用示范关规则，并非完整独立关卡库。
- 保留 8×8 联机前端：双人共 40 有效步轮流对战、独立计分；合作共用棋盘和 40 步，目标 8,000 分。联机依赖另行部署的兼容后端。
- 可从游戏设置入口切换模式；默认空配置下，联机界面会提示配置缺失，仍可返回单人模式。

## 配置自己的联机服务

`index.html` 默认只加载存在于仓库中的 `config.example.js`，不会尝试加载不存在的 `config.js`，因此无缺失配置文件的 404 请求。模板的 endpoint 和 publishableKey 均为空，绝不默认连接原应用。

1. 将 `config.example.js` 复制为 `config.js`。
2. 在本地 `config.js` 填入自己的 endpoint 和 publishableKey；如服务要求，增加自己的 oauthRelayBaseUrl。只使用允许公开给浏览器的配置，绝不能放管理密钥、服务端密钥或数据库密码。
3. 将 `index.html` 中 `<script src="config.example.js"></script>` 改为 `<script src="config.js"></script>`。提交源码前还原为模板引用，避免仓库缺文件；配置文件通过 `.gitignore` 排除。部署时单独提供真实配置。
4. 部署兼容 RPC、数据库表、访问控制和服务端校验，并允许前端部署源访问。单纯填写地址和公开键不能完成后端部署。

配置通过 `window.FOREST_CLOUD_CONFIG` 读取。只有发起联机请求时才加载原项目使用的 WorkBuddy Cloud SDK（jsDelivr 上的 `@tencent-ai/workbuddy-cloud-sdk@dev`），因此联机需要网络及该 SDK 服务可用。`dev` 为可变版本，正式维护时应自行验证并固定兼容版本；本包未下载或内置第三方 SDK。

邀请链接基于当前前端页面地址生成，与后端 endpoint 分离。本地回环地址仅本机可访问；供朋友使用时需自行部署可访问的前端与兼容后端。

## 未包含的后端与接口

在当前项目目录中未找到可打包的 `.sql` 文件。本次未访问或修改云端，也未导出数据库。因此本包不包含 `forest_rooms` 表、`forest_room` / `forest_play` RPC 实现、迁移 SQL、RLS 策略或后端部署脚本；上传 GitHub 或部署静态站点不会自动获得联机能力。

`multiplayer.js` 通过 `client.database.rpc('forest_room', payload)` 调用后端：

- 操作 `op`：create、join、poll、start、move、leave。
- 公共参数：room_code、player_token；创建/加入还传 nickname、game_mode；走步传 action、a、z、expected_revision。
- 响应需兼容 code、mode、status、server_time、started_at、round、self、players 及 shared；shared 含 board、moves、score、turn、revision、chain、tools 等当前前端读取的字段。
- 服务端必须自行实现成员凭证校验、回合与合法步验证、计分、并发 revision 检查和事务一致性，不能信任客户端上报结果。完整消费字段以 `multiplayer.js` 为准。

以上为前端接口说明，不是可直接部署的后端实现。本次不宣称通过真实双端联机验证。

## 文件

- index.html：入口和页面结构。
- style.css、theme.css：样式与主题。
- engine.js、game.js：基础引擎、公共界面与 SVG 绘制。
- solo-engine.js、solo-ui.js：单人规则、交互与动画。
- multiplayer.js：可配置联机客户端。
- adventure.js：地图和本机进度。
- forest-scene.svg：本地背景资源。
- config.example.js：不含真实配置的模板。
- .gitignore：排除本地配置、密钥、截图、缓存、依赖和验证输出。
- README.md：使用说明。

## 私有使用与素材说明

建议先上传至自己的私有 GitHub 仓库，用于个人保存、学习与开发。本包未添加任何开源许可证，也不表示授予第三方自由复制、再分发或商业使用的许可；公开发布前请自行确定授权范围。

游戏动物、道具与场景使用本项目绘制的 SVG 和 CSS，属于参考休闲三消视觉风格进行的原创重绘，不包含参考游戏截图、原作 logo 或下载的原版素材，不宣称逐像素复刻或与原作存在官方关系。此说明不替代完整的知识产权审查。

## 上传提示

此目录仅用于源码保存；上传 GitHub 不会发布游戏或部署联机后端。请只上传此目录的 13 个白名单文件，不要上传父目录中的用户文件、工具元数据、截图、验证输出或真实配置。仓库默认私有，未添加开源许可证。

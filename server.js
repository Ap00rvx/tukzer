"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dbConnection_1 = __importDefault(require("./database/dbConnection"));
const chapter_routes_1 = __importDefault(require("./routes/chapter.routes"));
const rate_limitter_1 = require("./middleware/rate_limitter");
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.use(express_1.default.json());
(0, dbConnection_1.default)();
app.get('/', (req, res) => {
    res.send('Hello, World!');
});
app.use(rate_limitter_1.rateLimitMiddleware);
app.use('/api/v1/chapters', chapter_routes_1.default);
app.use('/api/v1/user', user_routes_1.default);
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

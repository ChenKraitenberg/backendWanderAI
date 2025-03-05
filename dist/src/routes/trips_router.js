"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/trip_routes.ts
const express_1 = __importDefault(require("express"));
const auth_controller_1 = require("../controllers/auth_controller");
const trips_controller_1 = __importDefault(require("../controllers/trips_controller"));
const trips_model_1 = __importDefault(require("../models/trips_model"));
const router = express_1.default.Router();
// כל הנתיבים מוגנים עם auth
//router.use(authMiddleware);
// CRUD endpoints
router.get('/', trips_controller_1.default.getAll.bind(trips_controller_1.default));
router.get('/user', trips_controller_1.default.getByUser.bind(trips_controller_1.default));
//router.get('/:id', tripController.getById.bind(tripController));
//router.post('/', authMiddleware, tripController.create.bind(tripController));
// trips_router.ts
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('Received trip data:', req.body);
        const trip = new trips_model_1.default(req.body);
        const savedTrip = yield trip.save();
        res.status(201).json(savedTrip);
    }
    catch (error) {
        console.error('Error saving trip:', {
            message: error.message,
            errors: error.errors,
        });
        res.status(400).json({
            message: error.message,
            errors: error.errors,
        });
    }
}));
router.put('/:id', auth_controller_1.authMiddleware, trips_controller_1.default.update.bind(trips_controller_1.default));
router.delete('/:id', auth_controller_1.authMiddleware, trips_controller_1.default.deleteItem.bind(trips_controller_1.default));
exports.default = router;
//# sourceMappingURL=trips_router.js.map
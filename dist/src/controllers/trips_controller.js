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
const base_controller_1 = __importDefault(require("./base_controller"));
const trips_model_1 = __importDefault(require("../models/trips_model"));
class TripController extends base_controller_1.default {
    constructor() {
        super(trips_model_1.default);
    }
    // Override create to include userId
    // async create(req: Request, res: Response) {
    //   try {
    //     const tripData = {
    //       ...req.body,
    //       userId: req.params.userId, // מגיע מה-auth middleware
    //     };
    //     const newTrip = await this.model.create(tripData);
    //     res.status(201).send(newTrip);
    //   } catch (error) {
    //     console.error('Error creating trip:', error);
    //     res.status(400).send(error);
    //   }
    // }
    createTrip(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const tripData = req.body;
                // השלמת ערכים חסרים
                const completeTrip = {
                    title: tripData.title || 'טיול חדש',
                    preferences: Object.assign(Object.assign({}, tripData.preferences), { style: ((_a = tripData.preferences) === null || _a === void 0 ? void 0 : _a.style) || 'balanced' }),
                };
                const newTrip = yield this.model.create(completeTrip);
                res.status(201).send(newTrip);
            }
            catch (error) {
                console.error('Error creating trip:', error);
                res.status(400).send(error);
            }
        });
    }
    // Override getAll to get only user's trips
    getAll(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const trips = yield this.model.find({ userId: req.params.userId }).sort({ createdAt: -1 });
                res.status(200).send(trips);
            }
            catch (error) {
                console.error('Error fetching trips:', error);
                res.status(400).send(error);
            }
        });
    }
    // Override delete to check ownership
    deleteItem(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const trip = yield this.model.findOne({
                    _id: req.params.id,
                    userId: req.params.userId,
                });
                if (!trip) {
                    res.status(404).send('Trip not found or unauthorized');
                    return;
                }
                yield trip.deleteOne();
                res.status(200).send();
            }
            catch (error) {
                console.error('Error deleting trip:', error);
                res.status(400).send(error);
            }
        });
    }
    // Override update to check ownership
    update(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const trip = yield this.model.findOneAndUpdate({
                    _id: req.params.id,
                    userId: req.params.userId,
                }, req.body, { new: true });
                if (!trip) {
                    res.status(404).send('Trip not found or unauthorized');
                }
                res.status(200).send(trip);
            }
            catch (error) {
                console.error('Error updating trip:', error);
                res.status(400).send(error);
            }
        });
    }
    getByUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const trips = yield this.model.find({ userId: req.params.userId });
                res.status(200).send(trips);
            }
            catch (error) {
                console.error('Error fetching trips:', error);
                res.status(400).send(error);
            }
        });
    }
}
exports.default = new TripController();
//# sourceMappingURL=trips_controller.js.map
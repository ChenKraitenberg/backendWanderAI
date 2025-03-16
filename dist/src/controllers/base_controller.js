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
Object.defineProperty(exports, "__esModule", { value: true });
class BaseController {
    constructor(model) {
        this.model = model;
    }
    getAll(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Check for userId or owner filter in query parameters
                const userId = req.query.userId;
                const owner = req.query.owner;
                // Log what we're filtering by
                console.log('Filtering posts by:', { userId, owner });
                if (userId) {
                    // Filter by userId field
                    const items = yield this.model.find({ userId: userId });
                    console.log(`Found ${items.length} items with userId: ${userId}`);
                    res.status(200).send(items);
                }
                else if (owner) {
                    // Filter by owner field
                    const items = yield this.model.find({ owner: owner });
                    console.log(`Found ${items.length} items with owner: ${owner}`);
                    res.status(200).send(items);
                }
                else {
                    // No filter, return all items
                    const items = yield this.model.find();
                    console.log(`Found ${items.length} items total`);
                    res.status(200).send(items);
                }
            }
            catch (error) {
                console.error('Error in getAll:', error);
                res.status(400).send(error);
            }
        });
    }
    getById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            // changed to geyByUserId
            const itemId = req.params.id;
            try {
                const item = yield this.model.findById(itemId);
                if (item === null) {
                    res.status(404).send('not found');
                }
                else {
                    res.status(200).send(item);
                }
            }
            catch (error) {
                res.status(400).send(error);
            }
        });
    }
    create(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const item = req.body;
            // Log what we're creating
            console.log('Creating new item:', item);
            try {
                const newItem = yield this.model.create(item);
                console.log('Created item:', newItem);
                res.status(201).send(newItem);
            }
            catch (error) {
                console.error('Error creating item:', error);
                res.status(400).send(error);
            }
        });
    }
    deleteItem(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const itemId = req.params.id;
            console.log(`Deleting item with ID: ${itemId}`);
            try {
                yield this.model.findByIdAndDelete(itemId);
                res.status(200).send();
            }
            catch (error) {
                res.status(400).send(error);
            }
        });
    }
    update(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const item = req.body;
            const itemId = req.params.id;
            try {
                const updatedItem = yield this.model.findByIdAndUpdate(itemId, item, { new: true });
                res.status(200).send(updatedItem);
            }
            catch (error) {
                res.status(400).send(error);
            }
        });
    }
}
const createController = (model) => {
    return new BaseController(model);
};
exports.default = BaseController;
//# sourceMappingURL=base_controller.js.map
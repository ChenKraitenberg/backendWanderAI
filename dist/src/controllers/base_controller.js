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
            const ownerFilter = req.query.owner;
            try {
                if (ownerFilter) {
                    const posts = yield this.model.find({ owner: ownerFilter });
                    res.status(200).send(posts);
                }
                else {
                    const posts = yield this.model.find();
                    res.status(200).send(posts);
                }
            }
            catch (error) {
                res.status(400).send(error);
            }
        });
    }
    getById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const postId = req.params.id;
            try {
                const post = yield this.model.findById(postId);
                if (post === null) {
                    return res.status(404).send('not found');
                }
                else {
                    return res.status(200).send(post);
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
            try {
                const newItem = yield this.model.create(item);
                res.status(201).send(newItem);
            }
            catch (error) {
                res.status(400).send(error);
            }
        });
    }
    deleteItem(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const itemnId = req.params.id;
            console.log(`Deleting trip with ID: ${itemnId}`); // Log the request
            try {
                yield this.model.findByIdAndDelete(itemnId);
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
exports.default = BaseController;
//# sourceMappingURL=base_controller.js.map
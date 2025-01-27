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
exports.completeModule = exports.getModules = void 0;
const Module_1 = __importDefault(require("../models/Module"));
// Get all modules for a user
const getModules = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const modules = yield Module_1.default.find({ userId });
        res.json(modules);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getModules = getModules;
// Complete a module
const completeModule = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { moduleId } = req.params;
        const module = yield Module_1.default.findById(moduleId);
        if (!module) {
            return res.status(404).json({ message: 'Module not found' });
        }
        module.completed = true;
        yield module.save();
        res.json({ message: 'Module marked as completed', module });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});
exports.completeModule = completeModule;

import FrameworkCore from "./Framework/FrameworkCore.js";
new FrameworkCore();

import ServiceManager from "./Services/ServicesManager.js";
import InitialService from "./Initial/InitialService.js";
import RouterService from "./Router/RouterService.js";
import GlobalService from "./Global/GlobalService.js";
import LayoutService from "./Layout/LayoutService.js";
import EventService from "./Event/EventService.js";
import HttpService from "./Http/HttpService.js";
import CacheService from "./Cache/CacheService.js";
import StateService from "./State/StateService.js";
import ReactiveService from "./Reactive/ReactiveService.js";
import StorageService from "./Storage/StorageService.js";
import UtilityService from "./Utility/UtilityService.js";
import ViewportService from "./Viewport/ViewportService.js";
import TextService from "./Text/TextService.js";
import SecurityService from "./Security/SecurityService.js";

export {
    ServiceManager, RouterService, GlobalService, LayoutService, EventService, HttpService, CacheService,
    StateService, ReactiveService, StorageService, ViewportService, UtilityService, TextService,
    SecurityService
}

'use strict';
(function() {

    //This handles settings access for frontend

    const dataAccess = require('../../lib/common/data-access.js');
    const fs = require('fs');

    angular
        .module('firebotApp')
        .factory('settingsService', function (utilityService) {
            let service = {};

            let settingsCache = {};

            function getSettingsFile() {
                return dataAccess.getJsonDbInUserData("/user-settings/settings");
            }

            function pushDataToFile(path, data) {
                try {
                    getSettingsFile().push(path, data);
                    settingsCache[path] = data;
                } catch (err) {} //eslint-disable-line no-empty
            }

            function getDataFromFile(path, forceCacheUpdate) {
                try {
                    if (settingsCache[path] == null || forceCacheUpdate) {
                        let data = getSettingsFile().getData(path);
                        settingsCache[path] = data;
                    }
                } catch (err) {} //eslint-disable-line no-empty
                return settingsCache[path];
            }

            function deleteDataAtPath(path) {
                getSettingsFile().delete(path);
                delete settingsCache[path];
            }

            service.getKnownBoards = function() {
                // This feeds the boardService with known boards and their lastUpdated values.
                let boards = getDataFromFile('/boards');
                return boards;
            };

            service.deleteKnownBoard = function(boardId) {
                // This will delete a known board if provided a board id.
                try {
                    deleteDataAtPath('/boards/' + boardId);
                } catch (err) {
                    console.log(err);
                }
            };

            service.getBoardLastUpdatedDatetimeById = function(id) {
                // Preparing for data from settings.json/boards/$boardId/lastUpdated
                let lastUpdatedDatetime = null;
                // Check if data is present for given board
                try {
                    lastUpdatedDatetime = getDataFromFile(`/boards/${id}/lastUpdated`);
                } catch (err) {
                    // TODO: We neet some handling of this error here, not quite sure what... 2am, might be better at 9am.. xD
                    console.log("We encountered an error, most likely there are no boards in file so we need to build the boards and save them first");
                }
                return lastUpdatedDatetime;
            };

            service.setBoardLastUpdatedDatetimeById = function(boardId, boardDate) {
                // Building the board with ID and lastUpdated before pushing to settings
                let settingsBoard = {
                    boardId: boardId,
                    lastUpdated: boardDate
                };
                pushDataToFile(`/boards/${boardId}`, settingsBoard);
            };

            service.getLastBoardId = function() {
                let boardId = getDataFromFile('/interactive/lastBoardId');
                let boardKnown = service.getKnownBoards().boardId;
                if (boardKnown === undefined || boardKnown === null) {
                    // Clear board from settings.
                    service.deleteLastBoardId();

                    // Get fresh list of known boards.
                    let knownBoards = service.getKnownBoards();
                    // See if we have any other known boards.
                    if (knownBoards !== null && knownBoards !== undefined && knownBoards !== {}) {
                        let newBoard = Object.keys(knownBoards)[0];
                        service.setLastBoardId(newBoard);
                        boardId = newBoard;
                    } else {
                        boardId = "";
                    }
                }
                return boardId != null ? boardId : "";
            };

            service.setLastBoardId = function(id) {
                pushDataToFile('/interactive/lastBoardId', id);
            };

            service.deleteLastBoardId = function(boardId) {
                deleteDataAtPath('/interactive/lastBoard');
                deleteDataAtPath('/interactive/lastBoardId');
                // Removing the board from settings
                deleteDataAtPath('/boards/' + boardId);
            };

            service.getCustomScriptsEnabled = function() {
                return getDataFromFile('/settings/runCustomScripts') === true;
            };

            service.setCustomScriptsEnabled = function(enabled) {
                pushDataToFile('/settings/runCustomScripts', enabled === true);
            };

            service.isBetaTester = function() {
                let betaTester = getDataFromFile('/settings/beta');
                return betaTester != null ? betaTester : "No";
            };

            service.setBetaTester = function(isTester) {
                pushDataToFile('/settings/beta', isTester);
            };

            service.getEmulator = function() {
                let emulator = getDataFromFile('/settings/emulation');
                return emulator != null ? emulator : "Robotjs";
            };

            service.setEmulator = function(emulator) {
                pushDataToFile('/settings/emulation', emulator);
            };

            service.getOverlayCompatibility = function() {
                let overlay = getDataFromFile('/settings/overlayImages');
                return overlay != null ? overlay : "Other";
            };

            service.setOverlayCompatibility = function(overlay) {
                let overlaySetting = overlay === 'OBS' ? overlay : 'Other';
                pushDataToFile('/settings/overlayImages', overlaySetting);
            };

            service.getTheme = function() {
                let theme = getDataFromFile('/settings/theme');
                return theme != null ? theme : "Light";
            };

            service.setTheme = function(theme) {
                pushDataToFile('/settings/theme', theme);
            };

            service.soundsEnabled = function() {
                let sounds = getDataFromFile('/settings/sounds');
                return sounds != null ? sounds : "On";
            };

            service.setSoundsEnabled = function(enabled) {
                pushDataToFile('/settings/sounds', enabled);
            };

            /*
            * 0 = off,
            * 1 = bugfix,
            * 2 = feature,
            * 3 = major release,
            * 4 = betas
            */
            service.getAutoUpdateLevel = function() {
                let updateLevel = getDataFromFile('/settings/autoUpdateLevel');
                return updateLevel != null ? updateLevel : 2;
            };

            service.setAutoUpdateLevel = function(updateLevel) {
                pushDataToFile('/settings/autoUpdateLevel', updateLevel);
            };

            service.notifyOnBeta = function() {
                let beta = getDataFromFile('/settings/notifyOnBeta');
                return beta != null ? beta : false;
            };

            service.setNotifyOnBeta = function(beta) {
                pushDataToFile('/settings/notifyOnBeta', beta === true);
            };

            service.isFirstTimeUse = function() {
                let ftu = getDataFromFile('/settings/firstTimeUse');
                return ftu != null ? ftu : true;
            };

            service.setFirstTimeUse = function(ftu) {
                pushDataToFile('/settings/firstTimeUse', ftu === true);
            };

            service.hasJustUpdated = function() {
                let updated = getDataFromFile('/settings/justUpdated');
                return updated != null ? updated : false;
            };

            service.setJustUpdated = function(justUpdated) {
                pushDataToFile('/settings/justUpdated', justUpdated === true);
            };

            service.getButtonViewMode = function(type) {
                if (type === "commands") {
                    let buttonViewMode = getDataFromFile('/settings/buttonViewModeCommands');
                    return buttonViewMode != null ? buttonViewMode : 'list';
                }
                let buttonViewMode = getDataFromFile('/settings/buttonViewMode');
                return buttonViewMode != null ? buttonViewMode : 'grid';

            };

            service.setButtonViewMode = function(buttonViewMode, type) {
                if (type === "commands") {
                    pushDataToFile('/settings/buttonViewModeCommands', buttonViewMode);
                } else {
                    pushDataToFile('/settings/buttonViewMode', buttonViewMode);
                }
            };

            service.getOverlayVersion = function() {
                let version = getDataFromFile('/settings/copiedOverlayVersion');
                return version != null ? version : "";
            };

            service.setOverlayVersion = function(newVersion) {
                pushDataToFile('/settings/copiedOverlayVersion', newVersion.toString());
            };

            service.getWebServerPort = function() {
                let serverPort = getDataFromFile('/settings/webServerPort');
                return serverPort != null ? serverPort : 7473;
            };

            service.getWebSocketPort = function() {
                let websocketPort = getDataFromFile('/settings/websocketPort');
                return websocketPort != null ? websocketPort : 8080;
            };

            service.setWebSocketPort = function(port) {
                // Ensure port is a number.
                if (!Number.isInteger(port)) {
                    return;
                }

                // Save to settings file for app front end
                pushDataToFile('/settings/websocketPort', port);

                let path = dataAccess.getPathInWorkingDir("/resources/overlay/js/port.js");

                // Overwrite the 'port.js' file in the overlay settings folder with the new port
                fs.writeFile(path, `window.WEBSOCKET_PORT = ${port}`,
                    'utf8', () => {
                        console.log(`Set overlay port to: ${port}`);
                    });
            };

            service.showOverlayInfoModal = function(instanceName) {
                utilityService.showOverlayInfoModal(instanceName);
            };

            service.getClearCustomScriptCache = function() {
                let clear = getDataFromFile('/settings/clearCustomScriptCache');
                return clear != null ? clear : false;
            };

            service.setClearCustomScriptCache = function(clear) {
                pushDataToFile('/settings/clearCustomScriptCache', clear === true);
            };

            service.useOverlayInstances = function() {
                let oi = getDataFromFile('/settings/useOverlayInstances');
                return oi != null ? oi : false;
            };

            service.setUseOverlayInstances = function(oi) {
                pushDataToFile('/settings/useOverlayInstances', oi === true);
            };

            service.getOverlayInstances = function() {
                let ois = getDataFromFile('/settings/overlayInstances');
                return ois != null ? ois : [];
            };

            service.setOverlayInstances = function(ois) {
                pushDataToFile('/settings/overlayInstances', ois);
            };

            service.backupKeepAll = function() {
                let backupKeepAll = getDataFromFile('/settings/backupKeepAll');
                return backupKeepAll != null ? backupKeepAll : false;
            };

            service.setBackupKeepAll = function(backupKeepAll) {
                pushDataToFile('/settings/backupKeepAll', backupKeepAll === true);
            };

            service.backupOnExit = function() {
                let save = getDataFromFile('/settings/backupOnExit');
                return save != null ? save : false;
            };

            service.setBackupOnExit = function(backupOnExit) {
                pushDataToFile('/settings/backupOnExit', backupOnExit === true);
            };

            service.backupBeforeUpdates = function() {
                let backupBeforeUpdates = getDataFromFile('/settings/backupBeforeUpdates');
                return backupBeforeUpdates != null ? backupBeforeUpdates : false;
            };

            service.setBackupBeforeUpdates = function(backupBeforeUpdates) {
                pushDataToFile('/settings/backupBeforeUpdates', backupBeforeUpdates === true);
            };

            service.getAudioOutputDevice = function() {
                let device = getDataFromFile('/settings/audioOutputDevice');
                return device != null ? device : { label: "System Default", deviceId: "default"};
            };

            service.setAudioOutputDevice = function(device) {
                pushDataToFile('/settings/audioOutputDevice', device);
            };

            return service;
        });
}());

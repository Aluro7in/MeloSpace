import { World } from '@iwsdk/core';
import projectOptions from 'virtual:iwsdk-project';
import { PanelSystem } from './panel.js';

const sceneContainer = document.getElementById('scene-container');

if (!(sceneContainer instanceof HTMLDivElement)) {
  throw new Error('MeloSpace scene container was not found.');
}

World.create(sceneContainer, projectOptions)
  .then((world) => {
    world.registerSystem(PanelSystem);
    console.info('[MeloSpace] IWSDK world initialized.');
  })
  .catch((error: unknown) => {
    console.error('[MeloSpace] Failed to initialize the IWSDK world.', error);
  });

/**
 * The surface particulate-medusae exposes on `window`.
 *
 * Declared once, here, because three different files were each describing
 * `window.App` in their own terms and TypeScript merges those declarations
 * rather than choosing between them: the first one loaded won, and the others
 * silently lost the members they had added. One global deserves one truth.
 *
 * Everything below except `App` itself is the JellyTech patch to
 * public/static/medusae/app.develop.js. Upstream's own API is not described
 * here because nothing in the site calls it.
 */

interface MedusaFraming {
  /** Degrees around the animal. Unbounded: it is radially symmetric. */
  azimuth: number;
  /** Degrees above the horizon. */
  elevation: number;
  /** Multiple of upstream's default 500 * scale. */
  distance: number;
}

interface MedusaScene {
  framing?: MedusaFraming;
}

interface MedusaApp {
  /**
   * Builds the scene and starts the loop. Returns null when the renderer
   * cannot be created, rather than throwing, so a machine without WebGL keeps
   * its page.
   */
  startBackground?: (options?: {
    randomFraming?: boolean;
    framing?: MedusaFraming;
  }) => MedusaScene | null;
  stopBackground?: () => void;
  /** A framing rolled within App.FRAMING. */
  randomFraming?: () => MedusaFraming;
  /** Applies a framing to a running scene. */
  frameCamera?: (scene: MedusaScene, framing: MedusaFraming) => MedusaFraming | null;
  /** The live scene, or null/undefined when stopped. */
  scene?: MedusaScene | null;
  /** The bounds randomFraming rolls inside. */
  FRAMING?: {
    elevation: [number, number];
    distance: [number, number];
  };
}

interface Window {
  App?: MedusaApp;
}

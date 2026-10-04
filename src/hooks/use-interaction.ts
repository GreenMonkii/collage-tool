import { useEffect, useRef } from "react";
import type { CollageImage, Interaction } from "../types";
import type { CanvasSize } from "../types";

type UseInteractionOptions = {
  canvas: CanvasSize;
  stageRef: React.RefObject<HTMLDivElement | null>;
  onUpdate: (updater: (current: CollageImage[]) => CollageImage[]) => void;
};

/**
 * Manages pointer-based move / scale / rotate / crop interactions on canvas
 * images. Returns a ref that the caller uses to record the active interaction,
 * and a helper to start one from a pointer-down event.
 */
export function useInteraction({
  canvas,
  stageRef,
  onUpdate,
}: UseInteractionOptions) {
  const interactionRef = useRef<Interaction | null>(null);

  useEffect(() => {
    const onPointerMove = (event: PointerEvent) => {
      const interaction = interactionRef.current;
      const stage = stageRef.current;
      if (!interaction || !stage) return;

      const rect = stage.getBoundingClientRect();
      const dx =
        ((event.clientX - interaction.pointerX) / rect.width) * canvas.width;
      const dy =
        ((event.clientY - interaction.pointerY) / rect.height) * canvas.height;

      onUpdate((current) =>
        current.map((image) => {
          if (image.id !== interaction.id) return image;

          if (interaction.kind === "move") {
            const maxX = canvas.width - image.width * image.scale;
            const maxY = canvas.height - image.height * image.scale;
            return {
              ...image,
              x: Math.max(0, Math.min(maxX, interaction.imageX + dx)),
              y: Math.max(0, Math.min(maxY, interaction.imageY + dy)),
            };
          }

          if (interaction.kind === "crop") {
            const pointerDx = event.clientX - interaction.pointerX;
            const pointerDy = event.clientY - interaction.pointerY;
            const cropZoom = Math.max(image.cropZoom, 1.1);
            const overflowWidth = Math.max(
              0,
              image.naturalWidth * interaction.fitScale * cropZoom -
                interaction.frameWidth,
            );
            const overflowHeight = Math.max(
              0,
              image.naturalHeight * interaction.fitScale * cropZoom -
                interaction.frameHeight,
            );
            return {
              ...image,
              cropZoom,
              cropX:
                overflowWidth > 0
                  ? Math.max(
                      0,
                      Math.min(1, interaction.cropX - pointerDx / overflowWidth),
                    )
                  : interaction.cropX,
              cropY:
                overflowHeight > 0
                  ? Math.max(
                      0,
                      Math.min(1, interaction.cropY - pointerDy / overflowHeight),
                    )
                  : interaction.cropY,
            };
          }

          if (interaction.kind === "scale") {
            const distance = Math.hypot(
              event.clientX - interaction.centerX,
              event.clientY - interaction.centerY,
            );
            return {
              ...image,
              scale: Math.max(
                0.25,
                Math.min(
                  3,
                  interaction.scale *
                    (distance / Math.max(interaction.startDistance, 1)),
                ),
              ),
            };
          }

          // rotate
          const startAngle = Math.atan2(
            interaction.pointerY - interaction.centerY,
            interaction.pointerX - interaction.centerX,
          );
          const nextAngle = Math.atan2(
            event.clientY - interaction.centerY,
            event.clientX - interaction.centerX,
          );
          return {
            ...image,
            rotation:
              interaction.rotation + ((nextAngle - startAngle) * 180) / Math.PI,
          };
        }),
      );
    };

    const onPointerUp = () => {
      interactionRef.current = null;
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [canvas.height, canvas.width, onUpdate, stageRef]);

  function startInteraction(
    event: React.PointerEvent<HTMLElement>,
    image: CollageImage,
    kind: Interaction["kind"],
    mode: "freeform" | "grid",
  ) {
    if (!stageRef.current || (mode !== "freeform" && kind !== "crop")) return;
    event.preventDefault();
    event.stopPropagation();

    const imageElement = event.currentTarget.closest(".free-image, .grid-image");
    const imageRect = (imageElement ?? event.currentTarget).getBoundingClientRect();
    const fitScale = Math.max(
      imageRect.width / image.naturalWidth,
      imageRect.height / image.naturalHeight,
    );

    const centerX = imageRect.left + imageRect.width / 2;
    const centerY = imageRect.top + imageRect.height / 2;

    interactionRef.current = {
      id: image.id,
      kind,
      pointerX: event.clientX,
      pointerY: event.clientY,
      imageX: image.x,
      imageY: image.y,
      scale: image.scale,
      rotation: image.rotation,
      centerX,
      centerY,
      startDistance: Math.hypot(
        event.clientX - centerX,
        event.clientY - centerY,
      ),
      cropX: image.cropX,
      cropY: image.cropY,

      frameWidth: imageRect.width,
      frameHeight: imageRect.height,
      fitScale,
    };
  }

  return { interactionRef, startInteraction };
}

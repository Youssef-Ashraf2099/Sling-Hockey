import { useEffect, useRef } from "react";
import Matter from "matter-js";
import {
  GAME_CONFIG,
  PLAYER_POSITIONS,
  COLLISION_CATEGORIES,
} from "../../../core/config/gameConstants";
import { useShopStore } from "../../shop/store/shopStore";

export function usePhysicsEngine() {
  const engineRef = useRef(null);
  const worldRef = useRef(null);
  const pucksRef = useRef({ player1: [], player2: [] });
  const { getCurrentSkinData } = useShopStore();

  useEffect(() => {
    // Create engine with zero gravity
    const engine = Matter.Engine.create({
      gravity: GAME_CONFIG.GRAVITY,
      enableSleeping: true,
      positionIterations: 6,
      velocityIterations: 4,
    });

    engine.world.bounds = {
      min: { x: 0, y: 0 },
      max: { x: GAME_CONFIG.VIRTUAL_WIDTH, y: GAME_CONFIG.VIRTUAL_HEIGHT },
    };

    engineRef.current = engine;
    worldRef.current = engine.world;

    // Create game elements
    createWalls(engine.world);
    createCenterDivider(engine.world);
    createPucks(engine.world);

    // Start physics loop
    const runner = Matter.Runner.create();
    Matter.Runner.run(runner, engine);

    // Cleanup
    return () => {
      Matter.Runner.stop(runner);
      Matter.Engine.clear(engine);
      Matter.World.clear(engine.world);
    };
  }, []);

  const createWalls = (world) => {
    const {
      VIRTUAL_WIDTH,
      VIRTUAL_HEIGHT,
      WALL_THICKNESS,
      COLORS,
      WALL_RESTITUTION,
      WALL_FRICTION,
    } = GAME_CONFIG;

    const walls = [
      // Top wall
      Matter.Bodies.rectangle(
        VIRTUAL_WIDTH / 2,
        -WALL_THICKNESS / 2,
        VIRTUAL_WIDTH,
        WALL_THICKNESS,
        {
          isStatic: true,
          label: "wall-top",
          restitution: WALL_RESTITUTION,
          friction: WALL_FRICTION,
          render: { fillStyle: COLORS.WOOD_FRAME },
        }
      ),
      // Bottom wall
      Matter.Bodies.rectangle(
        VIRTUAL_WIDTH / 2,
        VIRTUAL_HEIGHT + WALL_THICKNESS / 2,
        VIRTUAL_WIDTH,
        WALL_THICKNESS,
        {
          isStatic: true,
          label: "wall-bottom",
          restitution: WALL_RESTITUTION,
          friction: WALL_FRICTION,
          render: { fillStyle: COLORS.WOOD_FRAME },
        }
      ),
      // Left wall
      Matter.Bodies.rectangle(
        -WALL_THICKNESS / 2,
        VIRTUAL_HEIGHT / 2,
        WALL_THICKNESS,
        VIRTUAL_HEIGHT,
        {
          isStatic: true,
          label: "wall-left",
          restitution: WALL_RESTITUTION,
          friction: WALL_FRICTION,
          render: { fillStyle: COLORS.WOOD_FRAME },
        }
      ),
      // Right wall
      Matter.Bodies.rectangle(
        VIRTUAL_WIDTH + WALL_THICKNESS / 2,
        VIRTUAL_HEIGHT / 2,
        WALL_THICKNESS,
        VIRTUAL_HEIGHT,
        {
          isStatic: true,
          label: "wall-right",
          restitution: WALL_RESTITUTION,
          friction: WALL_FRICTION,
          render: { fillStyle: COLORS.WOOD_FRAME },
        }
      ),
    ];

    Matter.Composite.add(world, walls);
  };

  const createCenterDivider = (world) => {
    const {
      VIRTUAL_WIDTH,
      SLOT_Y,
      SLOT_WIDTH,
      DIVIDER_THICKNESS,
      CORNER_RADIUS,
      COLORS,
      DIVIDER_RESTITUTION,
      DIVIDER_FRICTION,
    } = GAME_CONFIG;

    const leftDividerWidth = (VIRTUAL_WIDTH - SLOT_WIDTH) / 2;
    const rightDividerWidth = leftDividerWidth;

    // Left divider segment
    const dividerLeft = Matter.Bodies.rectangle(
      leftDividerWidth / 2,
      SLOT_Y,
      leftDividerWidth,
      DIVIDER_THICKNESS,
      {
        isStatic: true,
        label: "divider-left",
        restitution: DIVIDER_RESTITUTION,
        friction: DIVIDER_FRICTION,
        render: { fillStyle: COLORS.DIVIDER },
      }
    );

    // Right divider segment
    const dividerRight = Matter.Bodies.rectangle(
      VIRTUAL_WIDTH - rightDividerWidth / 2,
      SLOT_Y,
      rightDividerWidth,
      DIVIDER_THICKNESS,
      {
        isStatic: true,
        label: "divider-right",
        restitution: DIVIDER_RESTITUTION,
        friction: DIVIDER_FRICTION,
        render: { fillStyle: COLORS.DIVIDER },
      }
    );

    // Rounded corners at slot entrance (prevents puck sticking)
    const cornerLeft = Matter.Bodies.circle(
      (VIRTUAL_WIDTH - SLOT_WIDTH) / 2,
      SLOT_Y,
      CORNER_RADIUS,
      {
        isStatic: true,
        label: "corner-left",
        restitution: 0.8,
        friction: 0.05,
        render: { fillStyle: COLORS.DIVIDER },
      }
    );

    const cornerRight = Matter.Bodies.circle(
      (VIRTUAL_WIDTH + SLOT_WIDTH) / 2,
      SLOT_Y,
      CORNER_RADIUS,
      {
        isStatic: true,
        label: "corner-right",
        restitution: 0.8,
        friction: 0.05,
        render: { fillStyle: COLORS.DIVIDER },
      }
    );

    Matter.Composite.add(world, [
      dividerLeft,
      dividerRight,
      cornerLeft,
      cornerRight,
    ]);
  };

  const createPucks = (world) => {
    const skinData = getCurrentSkinData();
    const { PUCK_RADIUS } = GAME_CONFIG;

    // Create player 1 pucks (white/bottom)
    PLAYER_POSITIONS.PLAYER_1.pucks.forEach((pos, index) => {
      const puck = Matter.Bodies.circle(pos.x, pos.y, PUCK_RADIUS, {
        label: `puck-p1-${index}`,
        restitution: skinData.physics.restitution,
        friction: skinData.physics.friction,
        frictionAir: skinData.physics.frictionAir,
        frictionStatic: GAME_CONFIG.PUCK_FRICTION_STATIC,
        density: GAME_CONFIG.PUCK_DENSITY,
        mass: skinData.physics.mass,
        inertia: Infinity, // No rotation
        slop: 0.05,
        render: {
          fillStyle: PLAYER_POSITIONS.PLAYER_1.color,
        },
        customData: {
          player: 1,
          team: "white",
          skinId: skinData.id,
          index,
        },
      });

      pucksRef.current.player1.push(puck);
      Matter.Composite.add(world, puck);
    });

    // Create player 2 pucks (black/top)
    PLAYER_POSITIONS.PLAYER_2.pucks.forEach((pos, index) => {
      const puck = Matter.Bodies.circle(pos.x, pos.y, PUCK_RADIUS, {
        label: `puck-p2-${index}`,
        restitution: GAME_CONFIG.PUCK_RESTITUTION,
        friction: GAME_CONFIG.PUCK_FRICTION,
        frictionAir: GAME_CONFIG.PUCK_FRICTION_AIR,
        frictionStatic: GAME_CONFIG.PUCK_FRICTION_STATIC,
        density: GAME_CONFIG.PUCK_DENSITY,
        inertia: Infinity,
        slop: 0.05,
        render: {
          fillStyle: PLAYER_POSITIONS.PLAYER_2.color,
        },
        customData: {
          player: 2,
          team: "black",
          skinId: "classic",
          index,
        },
      });

      pucksRef.current.player2.push(puck);
      Matter.Composite.add(world, puck);
    });
  };

  const applyForce = (puck, force) => {
    if (!puck || !force) return;
    Matter.Body.applyForce(puck, puck.position, force);
  };

  const getPuckAtPosition = (x, y, radius = 30) => {
    const bodies = Matter.Composite.allBodies(worldRef.current);
    return bodies.find((body) => {
      if (!body.label.startsWith("puck")) return false;
      const dx = body.position.x - x;
      const dy = body.position.y - y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return distance <= radius;
    });
  };

  const checkSlotScoring = () => {
    const { SLOT_WIDTH, SLOT_Y, DIVIDER_THICKNESS, PUCK_RADIUS } = GAME_CONFIG;
    const bodies = Matter.Composite.allBodies(worldRef.current);
    const scored = [];

    bodies.forEach((body) => {
      if (!body.label.startsWith("puck")) return;

      const inSlotX =
        Math.abs(body.position.x - GAME_CONFIG.VIRTUAL_WIDTH / 2) <
        SLOT_WIDTH / 2;
      const inSlotY =
        Math.abs(body.position.y - SLOT_Y) < DIVIDER_THICKNESS + PUCK_RADIUS;

      // Check if puck passed through slot
      const passedThrough =
        inSlotX && body.customData && !body.customData.scored;

      if (passedThrough) {
        // Determine which side puck came from
        const fromTop = body.position.y < SLOT_Y;
        const fromBottom = body.position.y > SLOT_Y;

        if (
          (fromTop && body.customData.player === 2) ||
          (fromBottom && body.customData.player === 1)
        ) {
          body.customData.scored = true;
          scored.push({
            puck: body,
            player: body.customData.player,
            team: body.customData.team,
          });
        }
      }
    });

    return scored;
  };

  const resetPucks = () => {
    // Remove existing pucks
    pucksRef.current.player1.forEach((puck) => {
      Matter.Composite.remove(worldRef.current, puck);
    });
    pucksRef.current.player2.forEach((puck) => {
      Matter.Composite.remove(worldRef.current, puck);
    });

    pucksRef.current = { player1: [], player2: [] };

    // Recreate pucks
    createPucks(worldRef.current);
  };

  return {
    engine: engineRef.current,
    world: worldRef.current,
    pucks: pucksRef.current,
    applyForce,
    getPuckAtPosition,
    checkSlotScoring,
    resetPucks,
  };
}

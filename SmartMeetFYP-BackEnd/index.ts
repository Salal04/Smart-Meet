import express from "express";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import cors from "cors";
import bodyParser from "body-parser";
import path from "path";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";

import organRoute from "./Src/Presentation/OrganizationRoutes/organization.js";
import userRoute from "./Src/Presentation/userRoutes/users.js";
import MemberRoute from "./Src/Presentation/MemberRoutes/Members.js";
import MeetingRoute from "./Src/Presentation/MeetingRoutes/Meeting.js";
import { resolvers } from "./Src/Infrastructure/GraphQL/resolver.js";
import { verifyUser } from "./Src/Presentation/MiddleWares/jwtAuthMiddleware.js";
import PostSQLClient from "./Src/Infrastructure/Database/dbCon.js";

const app = express();
const port = process.env.PORT || 4000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const typeDefs = readFileSync(
  path.join(__dirname, "./Src/Infrastructure/GraphQL/schema.graphql"),
  "utf-8"
);

const startServer = async () => {

  await PostSQLClient.connectWithRetry();
  const server = new ApolloServer({ typeDefs, resolvers });
  await server.start();

  app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'ngrok-skip-browser-warning']
  }));

  app.use(
    "/graphql",
    verifyUser,
    cors(),
    bodyParser.json(),
    (req, res, next) => {
      next();
    },
    expressMiddleware(server, {
      context: async ({ req }) => {
        //@ts-ignore
        console.error('[Context]: ', req.user?.id);
        //@ts-ignore
        return { userId: req.user?.id };
      },
    })
  );

  app.use(bodyParser.json({ limit: "10mb" }));
  app.use(cors());
  
  // Serve uploads folder
  app.use("/uploads", express.static(path.join(__dirname, "uploads")));

  // REST routes
  app.use("/api", userRoute);
  app.use("/api", organRoute);
  app.use("/api", MeetingRoute);
  app.use("/api", MemberRoute);
 
  app.get("/check", (req, res) => {
    console.log("server checked!");
    res.status(200).json("Everything is okay");
  });

  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
};

startServer();



module.exports = {
  name: "neighbor",
  port: 3021,
  exposes: {
    "./routes": "./src/routes.tsx",
  },
  routes: {
    url: "http://localhost:3021/remoteEntry.js",
    scope: "neighbor",
    module: "./routes",
  },
  menus: [
    {
      text: "Neighbor",
      to: "/erxes-plugin-neighbor?type=kindergarden",
      image: "/images/icons/erxes-05.svg",
      location: "settings",
      scope: "Neighbor",
      action: "",
      permissions: [],
    },
  ],
};

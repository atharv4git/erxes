import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import React from 'react';
import { Route } from 'react-router-dom';

const List = asyncComponent(() =>
  import(/* webpackChunkName: "List - Tags" */ './containers/List')
);

const tags = ({ match }) => {
  console.log("route")
  return <List type={match.params.type} />;
};

const routes = () => {
  return <Route path="/tags/:type" component={tags} />;
};

export default routes;

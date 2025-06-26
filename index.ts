import app from './routes';

app.listen(Bun.env.PORT || 3000, () => {
  console.log(`🦊 Server is running at ${app.server?.hostname}:${app.server?.port}`);
});

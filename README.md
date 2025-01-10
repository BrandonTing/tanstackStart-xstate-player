# tanstackStart-xstate-player

The project started as a demo project to demonstrate what I learned from an OTT project at work, but then quickly becomes playground of some interesting libraries: Tanstack start, XState and Effect-ts. I had a lot of fun building around these libraries and highly recommend everyone to try them at least once, although I'd admit that XState and Effect-ts might look overwhelming at first.

## Tanstack Start
I work with React Router v6 just recently, and I like the loader concept. However the lack of type-safe search params bothers me, on the other hand tanstack router solved the issue completely. The loaderDeps is kinda wierd at first glance but I could imagine it being useful in more complex applications. `Route.useLoaderDate` is so cool! God knows how many times I have complained about manually type casting loader data. Server Action is pretty straightforward. I like the `validator` part.

### Small Complain
[Pathless Routes/Layout](https://tanstack.com/router/latest/docs/framework/react/guide/routing-concepts#pathless-routes) part doesn't work as I expected. In my use-case, I am creating some auth-protected routes inside `_auth` folder, and I expect layout file can also lie in this folder. However, if I tries to create a `_auth.tsx` or `layout.tsx` file, tanstack will automaticlly set it's route path as `/_auth/_auth/`. Therefore I need to put layout at root route folder.

## XState
I LOVE XState. I introduce it to my team in last project and it helps a lot. The state machine makes things more maintainable and I have only used some portion of its power. `parallel` and `tags` are 2 new things I learned when building this and both are super useful. I can see tags being used a lot more frequently but parallel will come in clutch in some cases. 

### Small Complain
I would love to use guard instead but I cannot access self/current tag from guard function. Xstate is OSS so maybe it's time to look into it to see if I could make it happen. 

## Effect-TS
People talks about Effect-TS a lot last year, but I don't get the time to try it myself at the time. Generally, I love the ability to understand what `Error` occurs during the program, but since the project itself is not that complex, the error handling part doesn't help too much. Avoiding plain try-catch and unknown error type are great for sure. `Services` are super cool and useful. Also it requires developer to think more deeply about how to abstract. `Match` is great, but I will have to check the performance impact in larger project. `Schema` is pretty useful too.

### Small Complain
I understand the reason behind `encode` in Schema.transform, but IMO most application only transform one data structure to another. If Schema can provide an API that allows developer to ignore encode part the transform it would be really nice. 

## Convex
The code-gen & schema syncing ability is super cool! Types are clear too.

### Small Complain
As far as I know, Convex doesn't provide a method to prefetch data before component mounted. Also the search feature on the offical site doesn't provide what I am looking for most of the time.
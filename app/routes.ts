import {index, layout, prefix, route, type RouteConfig,} from "@react-router/dev/routes";

export default [
  route('login', 'routes/login/page.tsx'),
  ...prefix("api", [
    route('queue', 'routes/api/queue.tsx'),
    ...prefix("booking", [
      index("routes/api/booking/booking.tsx"),
      route('date/:officeId/:date', 'routes/api/booking/date.tsx'),
      route('office', 'routes/api/booking/office.tsx'),
      route('client', 'routes/api/booking/client.tsx'),
      route('clients', 'routes/api/booking/clients.tsx'),
      route('record', 'routes/api/booking/record.tsx'),
      route('lock', 'routes/api/booking/lock.tsx'),
      route('update', 'routes/api/booking/update.tsx'),
    ]),


  ]),
  layout("./routes/layout.tsx", [
    index("routes/home.tsx"),
    route('clients', 'routes/clients/page.tsx'),
    route('booking', 'routes/booking/page.tsx'),
    route('booking/:id/documents', 'routes/documents/page.tsx'),
    route('schedule/:officeId?', 'routes/schedule/page.tsx'),
    route('users', 'routes/users/page.tsx'),
    route('offices', 'routes/offices/page.tsx'),
    route('log', 'routes/log/page.tsx'),
    route('templates/:templateId?', 'routes/templates/page.tsx'),
    route('records/:officeId?', 'routes/records/page.tsx')
  ]),
] satisfies RouteConfig;

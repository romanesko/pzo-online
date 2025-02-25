import {IconChevronDown, IconUser} from '@tabler/icons-react';
import {ActionIcon, Box, Burger, Center, Container, Drawer, Group, Menu} from '@mantine/core';
import {useDisclosure} from '@mantine/hooks';
import classes from './header-menu.module.css';
import {Link, useFetcher} from "react-router";
import {useEffect} from "react";

const links = [
  {link: '/booking', label: 'Календарь', role: 'OPERATOR'},

  {link: '/clients', label: 'Клиенты', role: 'OPERATOR'},
  {link: '/records', label: 'Записи', role: 'OPERATOR'},
  {
    link: '', label: 'Администрирование', role: 'ADMIN', links: [
      {link: '/schedule', label: 'Расписание', role: 'ADMIN'},
      {link: '/offices', label: 'Клиники', role: 'ADMIN'},
      {link: '/users', label: 'Пользователи системы', role: 'ADMIN'},
      {link: '/log', label: 'Лог действий', role: 'ADMIN'},
      {link: '/templates', label: 'Шаблоны документов', role: 'ADMIN'}
    ]
  },

] as any[];

function RenderLink({item, roles, children}: { item: any, roles: string[], children?: any }) {
  if (roles.includes(item.role))
    return <Link to={item.link} className={classes.link} onClick={(e) => {
      if (!item.link) {
        e.preventDefault()
        return
      }
      close()
    }}>{children ? children : item.label}</Link>

  return <></>
}

export default function HeaderMenu({roles}: { roles: string[] }) {
  const [opened, {toggle, close}] = useDisclosure(false);

  // roles = ['admin2']

  const fetcher = useFetcher()

  useEffect(() => {
    if (fetcher.data) {
      console.log('fetcher.data', fetcher.data)
      if (fetcher.data.error) {
        alert(fetcher.data.error)
        return
      }
    }
  }, [fetcher.data])

  function logout() {

    fetcher.submit({action: 'logout'}, {action: '/login', method: 'post'}).then(res => {

    })


  }

  const vItems = links.map((link) => {
    const menuItems = link.links?.map((item: any) => <RenderLink key={item.link} item={item} roles={roles}/>);

    if (menuItems) {
      return (
          <Menu key={link.label} trigger="hover" transitionProps={{exitDuration: 0}} withinPortal>
            <Menu.Target>
              <RenderLink item={link} roles={roles} key={link.link}>
                <span className={classes.linkLabel}>{link.label}</span>
              </RenderLink>
            </Menu.Target>
            <div style={{marginLeft: 20}}>{menuItems}</div>
          </Menu>
      );
    }

    return <RenderLink item={link} roles={roles} key={link.label}/>
  });


  const items = links.map((link) => {
    const menuItems = link.links?.map((item: any) => (
        <Box key={item.link} py={4} px={2}>
          <RenderLink item={item} roles={roles} key={item.link}/>

        </Box>
    ));

    if (menuItems) {
      return (
          <Menu key={link.label} trigger="hover" transitionProps={{exitDuration: 0}} withinPortal>
            <Menu.Target>
              {roles.includes(link.role) ? <Link
                  to={link.link || ""} className={classes.link} onClick={e => {
                if (!link.link) {
                  console.log('prevent')
                  e.preventDefault()
                }
              }}>
                <Center>
                  <span className={classes.linkLabel}>{link.label}</span>
                  <IconChevronDown size={14} stroke={1.5}/>
                </Center>
              </Link> : <div></div>}
            </Menu.Target>
            <Menu.Dropdown>{menuItems}</Menu.Dropdown>
          </Menu>
      );
    }

    return <RenderLink item={link} roles={roles} key={link.label}/>

  });

  return (
      <header className={classes.header}>
        <Drawer opened={opened} onClose={close} title="Меню">
          {vItems}
        </Drawer>
        <Container size="md">
          <div className={classes.inner}>
            {/*<MantineLogo size={28} />*/}
            <Group gap={5} visibleFrom="sm">
              {items}
            </Group>

            <Burger opened={opened} onClick={toggle} size="sm" hiddenFrom="sm"/>

            <div>
              <Menu trigger="hover" transitionProps={{exitDuration: 0}} withinPortal>
                <Menu.Target>
                  <ActionIcon variant="outline" aria-label="Settings">
                    <IconUser style={{width: '70%', height: '70%'}} stroke={1.5}/>
                  </ActionIcon>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Item onClick={logout}>Logout</Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </div>
          </div>

        </Container>
      </header>
  );
}

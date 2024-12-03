import { FC } from "react"
import { ItemType, menuItems } from "../layouts/menu-items"
import { Logo } from "./logo"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from "./ui/sidebar"
import { UserBar } from "./user-bar"
 


const MenuItems:FC<{items: ItemType[]}> = ({items}) => {
  const menuItems: React.JSX.Element[] = []

  for(const item of items) {
    const children = item.children.map(c => (
      <SidebarMenuItem key={item.title}>
        <SidebarMenuButton asChild>
          <a href={c.link?.href}>
            <c.icon />
            <span>{c.title}</span>
          </a>
        </SidebarMenuButton>
      </SidebarMenuItem>
    ));

    menuItems.push(
      <SidebarGroup>
        <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {children}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }

  return menuItems  
}

export function AppSidebar({emailHash, username}: {emailHash: string, username: string}) {
  const { isMobile } = useSidebar()

  return (
    <Sidebar>
      <SidebarHeader>
        <Logo />
      </SidebarHeader>
      <SidebarContent>
        <MenuItems items={menuItems} />
      </SidebarContent>
      <SidebarFooter>
        <UserBar emailHash={emailHash} username={username} />
      </SidebarFooter>
    </Sidebar>
  )
}
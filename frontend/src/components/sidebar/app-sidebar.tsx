import * as React from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Moon, Sun, Plus, UserPlus2 } from "lucide-react"
import { Switch } from "../ui/switch"
import CreateNewChat from "../chat/CreateNewChat"
import NewGroupChatModal from "../chat/NewGroupChatModal"
import GroupChatList from "../chat/GroupChatList"
import AddFriendModal from "../chat/AddFriendModal"
import DirrectMessageList from "../chat/DirrectMessageList"
import FriendSidebarList from "../chat/FriendSidebarList"
import { useThemeStore } from "@/stores/useThemeStore"
import { useAuthStore } from "@/stores/useAuthStore"
import { NavUser } from "./nav-user"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const {isDark,toggleTheme} = useThemeStore();
  const {user} = useAuthStore();
  return (
    <Sidebar variant="inset" {...props}>
      {/* header */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
            size="lg"
             asChild
            className="bg-gradient-primary"
            >
              <a href="#">
                <div
                className="flex w-full items-center px-2  gap-20">  {/*justify-beetwen*/}
                  <h1 className="text-xl font-bold text-white ">Moij</h1>
                  <div className="flex items-center gap-2">
                    <Sun className="size-4 text-white/80 "/>
                    <Switch
                    checked={isDark}
                    onCheckedChange={toggleTheme}
                    className="data-[state=checked]:bg-background/80"
                    />
                    <Moon className="size-4 text-white/80"/>
                  </div>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      {/* content */}
      <SidebarContent className="beautiful-scrollbar">
        {/* new chat */}
        <SidebarGroup>
          <SidebarGroupContent>
            <CreateNewChat/>
          </SidebarGroupContent>
        </SidebarGroup>


        {/* group chat */}
        <SidebarGroup>
          <SidebarGroupLabel className="uppercase">
            nhóm chat
          </SidebarGroupLabel>
          <NewGroupChatModal>
            <SidebarGroupAction title="Tạo Nhóm" className="cursor-pointer">
              <Plus />
            </SidebarGroupAction>
          </NewGroupChatModal>
          <SidebarGroupContent>
            <GroupChatList/>
          </SidebarGroupContent>
        </SidebarGroup>
        {/*   dirrect message */}
        <SidebarGroup>
          <SidebarGroupLabel className="uppercase">
            tin nhắn trực tiếp
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <DirrectMessageList/>
          </SidebarGroupContent>
        </SidebarGroup>
        
        {/* friends */}
        <SidebarGroup>
          <SidebarGroupLabel className="uppercase">
            bạn bè
          </SidebarGroupLabel>
          <AddFriendModal>
            <SidebarGroupAction title="Kết Bạn" className="cursor-pointer">
              <UserPlus2 />
            </SidebarGroupAction>
          </AddFriendModal>
          <SidebarGroupContent>
            <FriendSidebarList/>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        {user&&<NavUser user={user} />}
      </SidebarFooter>
    </Sidebar>
  )
}

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
import { Moon, Sun, Plus, UserPlus2, ChevronDown } from "lucide-react"
import { Switch } from "../ui/switch"
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "../ui/collapsible"
import CreateNewChat from "../chat/CreateNewChat"
import NewGroupChatModal from "../chat/NewGroupChatModal"
import AddFriendModal from "../chat/AddFriendModal"
import ChatList from "../chat/ChatList"
import ArchivedChatList from "../chat/ArchivedChatList"
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


        {/* chats */}
        <Collapsible defaultOpen className="group/collapsible">
          <SidebarGroup>
            <SidebarGroupLabel asChild className="uppercase flex justify-between cursor-pointer w-full group-data-[state=open]/collapsible:hover:bg-transparent">
              <CollapsibleTrigger>
                <span className="flex-1">đoạn chat</span>
                <ChevronDown className="w-4 h-4 text-muted-foreground transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180" />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <NewGroupChatModal>
              <SidebarGroupAction title="Tạo Nhóm" className="cursor-pointer">
                <Plus />
              </SidebarGroupAction>
            </NewGroupChatModal>
            <CollapsibleContent>
              <SidebarGroupContent>
                <ChatList/>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>
        
        {/* friends */}
        <Collapsible className="group/collapsible">
          <SidebarGroup>
            <SidebarGroupLabel asChild className="uppercase flex justify-between cursor-pointer w-full group-data-[state=open]/collapsible:hover:bg-transparent">
              <CollapsibleTrigger>
                <span className="flex-1">bạn bè</span>
                <ChevronDown className="w-4 h-4 text-muted-foreground transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180" />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <AddFriendModal>
              <SidebarGroupAction title="Kết Bạn" className="cursor-pointer">
                <UserPlus2 />
              </SidebarGroupAction>
            </AddFriendModal>
            <CollapsibleContent>
              <SidebarGroupContent>
                <FriendSidebarList/>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>

        {/* archived chats */}
        <Collapsible className="group/collapsible">
          <SidebarGroup>
            <SidebarGroupLabel asChild className="uppercase flex justify-between cursor-pointer w-full group-data-[state=open]/collapsible:hover:bg-transparent">
              <CollapsibleTrigger>
                <span className="flex-1 text-muted-foreground">đoạn chat lưu trữ</span>
                <ChevronDown className="w-4 h-4 text-muted-foreground transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180" />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <ArchivedChatList/>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>
      </SidebarContent>
      <SidebarFooter>
        {user&&<NavUser user={user} />}
      </SidebarFooter>
    </Sidebar>
  )
}

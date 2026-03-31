import { useThemeStore } from '@/stores/useThemeStore';
import { Popover, PopoverContent, PopoverTrigger } from '@radix-ui/react-popover';
import { Smile } from 'lucide-react';
import Picker from '@emoji-mart/react'
import data from "@emoji-mart/data"
interface EmojiPinkerProps{
    oncChange:(value:string)=>void;
}

const EmoijPicker = ({onChange}:EmojiPinkerProps) => {
    const {isDark} = useThemeStore();
    return (
    <Popover>
        <PopoverTrigger className='cursor-pointer'>
            <Smile className='size-4'/>
        </PopoverTrigger>
        <PopoverContent

               className='mb-5 mr-3'

        >
            <Picker
            theme={isDark?"dark":"light"}
            data={data}
            onEmojiSelect = {(emoji:any)=>onChange(emoji.native)}
            emojiSize = {24}
            
            />
        </PopoverContent>
    </Popover>
  )
}

export default EmoijPicker
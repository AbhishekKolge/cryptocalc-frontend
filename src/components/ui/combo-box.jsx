'use client';
import { useState, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import Image from 'next/image';
import { Check, Loader2 } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export function ComboBoxPopover(props) {
  const {
    className,
    data,
    isLoading,
    onSearch,
    value,
    reset,
    onLoadMore,
    onSelect,
    selected,
  } = props;
  const [open, setOpen] = useState(false);
  const { ref, inView } = useInView({
    threshold: 0,
  });

  const selectHandler = (value) => {
    onSelect(value);
    setOpen(false);
  };

  const togglePopoverHandler = (value) => {
    setOpen(value);
    !value && reset();
  };

  useEffect(() => {
    if (inView) {
      onLoadMore();
    }
  }, [inView]);

  return (
    <div className={cn('flex items-center space-x-4', className)}>
      <Popover open={open} onOpenChange={togglePopoverHandler}>
        <PopoverTrigger asChild>
          <Button
            variant='outline'
            size='sm'
            className='w-[120px] justify-center'
          >
            {selected ? (
              <div className='flex items-center gap-2'>
                <Avatar className='h-4 w-4'>
                  <AvatarImage
                    src={selected.iconUrl}
                    alt={`${selected.name} icon`}
                  />
                  <AvatarFallback className='text-[8px]'>NA</AvatarFallback>
                </Avatar>
                <span>
                  {selected.name.length > 5
                    ? `${selected.name.slice(0, 5)}...`
                    : selected.name}
                </span>
              </div>
            ) : isLoading ? (
              <Loader2 className='m-auto h-4 w-4 animate-spin' />
            ) : (
              'Coin'
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className='p-0' side='right' align='start'>
          <Command shouldFilter={false}>
            <CommandInput
              placeholder='Search...'
              onValueChange={onSearch}
              value={value}
            />

            <CommandList>
              <CommandGroup>
                {!!data?.length ? (
                  data.map((item, index) => {
                    const lastItem = index === data.length - 1;
                    const isSelected =
                      JSON.stringify(selected) === JSON.stringify(item);
                    return (
                      <CommandItem
                        ref={lastItem ? ref : null}
                        key={index}
                        onSelect={selectHandler.bind(null, item)}
                        className={cn('gap-4', isSelected && 'bg-slate-100')}
                      >
                        <Avatar className='h-4 w-4'>
                          <AvatarImage
                            src={item.iconUrl}
                            alt={`${item.name} icon`}
                          />
                          <AvatarFallback className='text-[8px]'>
                            NA
                          </AvatarFallback>
                        </Avatar>
                        <span>{`${item.name} (${item.symbol})`}</span>
                        {!!isSelected && <Check className='h-4 w-4' />}
                      </CommandItem>
                    );
                  })
                ) : isLoading ? (
                  <></>
                ) : (
                  <span className='text-center text-sm w-100 block p-4'>
                    Found nothing...
                  </span>
                )}
                {isLoading && (
                  <span className='text-center text-sm w-100 block p-4'>
                    <Loader2 className='m-auto h-4 w-4 animate-spin' />
                  </span>
                )}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

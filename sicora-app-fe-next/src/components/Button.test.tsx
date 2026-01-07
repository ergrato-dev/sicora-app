import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { Button } from './Button';

describe('Button', () => {
  it('renderiza correctamente con texto', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });

  it('aplica la variante primary por defecto', () => {
    render(<Button>Primary Button</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-green-600');
  });

  it('aplica la variante secondary cuando se especifica', () => {
    render(<Button variant='secondary'>Secondary Button</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-orange-500');
  });

  it('aplica el tamaño medium por defecto', () => {
    render(<Button>Medium Button</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('px-4', 'py-2', 'text-base');
  });

  it('aplica el tamaño large cuando se especifica', () => {
    render(<Button size='lg'>Large Button</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('px-6', 'py-3', 'text-lg');
  });

  it('se deshabilita cuando disabled es true', () => {
    render(<Button disabled>Disabled Button</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveClass('disabled:opacity-50', 'disabled:pointer-events-none');
  });

  it('ejecuta onClick cuando se hace clic', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(<Button onClick={handleClick}>Clickable Button</Button>);
    const button = screen.getByRole('button');

    await user.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('no ejecuta onClick cuando está deshabilitado', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(
      <Button onClick={handleClick} disabled>
        Disabled Button
      </Button>
    );
    const button = screen.getByRole('button');

    await user.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('acepta className personalizado', () => {
    render(<Button className='custom-class'>Custom Button</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
  });

  it('reenvía la ref correctamente', () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(<Button ref={ref}>Button with Ref</Button>);
    expect(ref.current).toBeTruthy();
    expect(ref.current?.tagName).toBe('BUTTON');
  });
});

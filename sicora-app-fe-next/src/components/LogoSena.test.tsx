import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { LogoSena, LogoSenaFooter, LogoSenaNav } from './LogoSena';

// Mock de los assets
vi.mock('../constants/assets', () => ({
  getSenaLogo: vi.fn((variant: string) => {
    const logos = {
      primary: '/mock-logo-primary.svg',
      complementary: '/mock-logo-complementary.svg',
      black: '/mock-logo-black.svg',
    };
    return logos[variant as keyof typeof logos] || logos.primary;
  }),
}));

describe('LogoSena', () => {
  it('renderiza correctamente con props por defecto', () => {
    render(<LogoSena />);
    const logo = screen.getByRole('img');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('alt', 'OneVision - OneVision Open Source');
  });

  it('aplica el tamaño medium por defecto', () => {
    render(<LogoSena />);
    const logo = screen.getByRole('img');
    expect(logo).toHaveClass('h-12', 'w-auto');
  });

  it('aplica diferentes tamaños correctamente', () => {
    const { rerender } = render(<LogoSena size='sm' />);
    let logo = screen.getByRole('img');
    expect(logo).toHaveClass('h-8');

    rerender(<LogoSena size='lg' />);
    logo = screen.getByRole('img');
    expect(logo).toHaveClass('h-16');

    rerender(<LogoSena size='xl' />);
    logo = screen.getByRole('img');
    expect(logo).toHaveClass('h-24');
  });

  it('usa la variante primary por defecto', () => {
    render(<LogoSena />);
    const logo = screen.getByRole('img');
    expect(logo).toHaveAttribute('src', '/mock-logo-primary.svg');
  });

  it('cambia de variante correctamente', () => {
    const { rerender } = render(<LogoSena variant='complementary' />);
    let logo = screen.getByRole('img');
    expect(logo).toHaveAttribute('src', '/mock-logo-complementary.svg');

    rerender(<LogoSena variant='black' />);
    logo = screen.getByRole('img');
    expect(logo).toHaveAttribute('src', '/mock-logo-black.svg');
  });

  it('acepta className personalizado', () => {
    render(<LogoSena className='custom-class' />);
    const logo = screen.getByRole('img');
    expect(logo).toHaveClass('custom-class');
  });

  it('aplica alt personalizado', () => {
    render(<LogoSena alt='Custom alt text' />);
    const logo = screen.getByRole('img');
    expect(logo).toHaveAttribute('alt', 'Custom alt text');
  });

  describe('cuando es clickable', () => {
    it('tiene cursor pointer y es clickable', () => {
      const handleClick = vi.fn();
      render(<LogoSena clickable onClick={handleClick} />);
      const logo = screen.getByRole('button');
      expect(logo).toHaveClass('cursor-pointer');
      expect(logo).toHaveAttribute('tabIndex', '0');
    });

    it('ejecuta onClick cuando se hace clic', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(<LogoSena clickable onClick={handleClick} />);
      const logo = screen.getByRole('button');

      await user.click(logo);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('ejecuta onClick con Enter', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(<LogoSena clickable onClick={handleClick} />);
      const logo = screen.getByRole('button');

      logo.focus();
      await user.keyboard('[Enter]');
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('ejecuta onClick con Space', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();

      render(<LogoSena clickable onClick={handleClick} />);
      const logo = screen.getByRole('button');

      logo.focus();
      await user.keyboard(' ');
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('cuando no es clickable', () => {
    it('no tiene cursor pointer ni es focusable', () => {
      render(<LogoSena />);
      const logo = screen.getByRole('img');
      expect(logo).not.toHaveClass('cursor-pointer');
      expect(logo).not.toHaveAttribute('tabIndex');
    });
  });
});

describe('LogoSenaNav', () => {
  it('renderiza con configuración de navegación', () => {
    render(<LogoSenaNav />);
    const logo = screen.getByRole('img');
    expect(logo).toHaveClass('h-12'); // tamaño md por defecto
    expect(logo).toHaveClass('select-none');
  });

  it('es clickable cuando se proporciona onClick', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(<LogoSenaNav onClick={handleClick} />);
    const logo = screen.getByRole('button');

    await user.click(logo);
    expect(handleClick).toHaveBeenCalledTimes(1);
    expect(logo).toHaveAttribute('alt', 'SENA - Ir al inicio');
  });

  it('no es clickable cuando no se proporciona onClick', () => {
    render(<LogoSenaNav />);
    const logo = screen.getByRole('img');
    expect(logo).not.toHaveClass('cursor-pointer');
  });

  it('aplica tamaño small cuando se especifica', () => {
    render(<LogoSenaNav size='sm' />);
    const logo = screen.getByRole('img');
    expect(logo).toHaveClass('h-8');
  });
});

describe('LogoSenaFooter', () => {
  it('renderiza con configuración de footer', () => {
    render(<LogoSenaFooter />);
    const logo = screen.getByRole('img');
    expect(logo).toHaveClass('h-8'); // tamaño sm
    expect(logo).toHaveClass('opacity-90');
    expect(logo).toHaveAttribute('alt', 'OneVision - OneVision Open Source');
  });

  it('usa variante primary por defecto', () => {
    render(<LogoSenaFooter />);
    const logo = screen.getByRole('img');
    expect(logo).toHaveAttribute('src', '/mock-logo-primary.svg');
  });

  it('puede usar variante black', () => {
    render(<LogoSenaFooter variant='black' />);
    const logo = screen.getByRole('img');
    expect(logo).toHaveAttribute('src', '/mock-logo-black.svg');
  });

  it('no es clickable', () => {
    render(<LogoSenaFooter />);
    const logo = screen.getByRole('img');
    expect(logo).not.toHaveClass('cursor-pointer');
  });
});

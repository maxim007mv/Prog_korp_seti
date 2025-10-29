document.addEventListener('DOMContentLoaded', () => {
  const root = document.documentElement;
  const srToast = document.getElementById('sr-toast');

  const announce = (message) => {
    if (!srToast) return;
    srToast.textContent = '';
    window.setTimeout(() => {
      srToast.textContent = message;
    }, 50);
  };

  const storage = {
    get(key) {
      try {
        return window.localStorage.getItem(key);
      } catch (error) {
        console.warn('LocalStorage get error', error);
        return null;
      }
    },
    set(key, value) {
      try {
        window.localStorage.setItem(key, value);
      } catch (error) {
        console.warn('LocalStorage set error', error);
      }
    }
  };

  const THEME_KEY = 'ui-theme';
  const themeToggle = document.getElementById('theme-toggle');
  const themeToggleIcon = document.getElementById('theme-toggle-icon');

  const setThemeButtonState = (theme) => {
    if (!themeToggle) return;
    const isDark = theme === 'dark';
    themeToggle.setAttribute('aria-pressed', isDark ? 'true' : 'false');
    if (themeToggleIcon) {
      themeToggleIcon.textContent = isDark ? '🌙' : '🌞';
    }
  };

  const applyTheme = (theme, { persist } = { persist: true }) => {
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    setThemeButtonState(theme);
    if (persist) {
      storage.set(THEME_KEY, theme);
    }
  };

  const resolveInitialTheme = () => {
    const stored = storage.get(THEME_KEY);
    if (stored === 'dark' || stored === 'light') {
      return stored;
    }
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  };

  applyTheme(resolveInitialTheme(), { persist: false });

  themeToggle?.addEventListener('click', () => {
    const isDark = root.classList.contains('dark');
    const nextTheme = isDark ? 'light' : 'dark';
    applyTheme(nextTheme);
    announce(`Включена ${nextTheme === 'dark' ? 'тёмная' : 'светлая'} тема интерфейса`);
  });

  if (window.matchMedia) {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handleMediaChange = (event) => {
      if (!storage.get(THEME_KEY)) {
        applyTheme(event.matches ? 'dark' : 'light', { persist: false });
      }
    };
    media.addEventListener('change', handleMediaChange);
  }

  const menuToggle = document.getElementById('menu-toggle');
  const mobileNav = document.getElementById('mobile-nav');
  if (menuToggle && mobileNav) {
    menuToggle.addEventListener('click', () => {
      const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
      const nextState = !expanded;
      menuToggle.setAttribute('aria-expanded', nextState ? 'true' : 'false');
      if (nextState) {
        mobileNav.classList.remove('hidden');
        mobileNav.setAttribute('aria-hidden', 'false');
        announce('Мобильное меню открыто');
        const firstLink = mobileNav.querySelector('a');
        if (firstLink) {
          window.setTimeout(() => firstLink.focus(), 50);
        }
      } else {
        mobileNav.classList.add('hidden');
        mobileNav.setAttribute('aria-hidden', 'true');
        announce('Мобильное меню закрыто');
        menuToggle.focus();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !mobileNav.classList.contains('hidden')) {
        menuToggle.setAttribute('aria-expanded', 'false');
        mobileNav.classList.add('hidden');
        mobileNav.setAttribute('aria-hidden', 'true');
        announce('Мобильное меню закрыто');
        menuToggle.focus();
      }
    });
  }

  const modal = document.querySelector('.modal');
  const modalTitle = document.getElementById('modal-title');
  const modalDesc = document.getElementById('modal-desc');
  const modalImg = document.getElementById('modal-img');

  document.querySelectorAll('.project[data-title]').forEach((card) => {
    card.addEventListener('click', () => {
      if (!modal) return;
      modalTitle.textContent = card.dataset.title || '';
      modalDesc.textContent = card.dataset.desc || '';
      modalImg.src = card.dataset.img || 'https://images.unsplash.com/photo-1521295121783-8a321d551ad2?q=80&w=1600&auto=format&fit=crop';
      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
      modal.querySelector('.modal__content')?.focus();
    });
  });

  modal?.addEventListener('click', (event) => {
    if (event.target.classList.contains('modal') || event.target.classList.contains('close-modal')) {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
    }
  });

  const chips = document.querySelectorAll('.chip[data-filter]');
  const cards = document.querySelectorAll('.project');
  if (chips.length && cards.length) {
    chips.forEach((chip) => chip.addEventListener('click', () => {
      chips.forEach((c) => c.classList.remove('active'));
      chip.classList.add('active');
      const filter = chip.dataset.filter;
      cards.forEach((card) => {
        const shouldShow = filter === 'all' || card.dataset.cat?.includes(filter);
        card.style.display = shouldShow ? '' : 'none';
      });
    }));
  }

  const addEntryButton = document.getElementById('add-entry');
  const timeline = document.getElementById('timeline');
  addEntryButton?.addEventListener('click', () => {
    const now = new Date();
    const item = document.createElement('div');
    item.className = 'item';
    item.innerHTML = `<strong>${now.toLocaleDateString()}</strong> — Новая запись (пример)`;
    timeline?.prepend(item);
  });

  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    const formStatus = document.getElementById('form-status');
    const dialogOverlay = document.getElementById('dialog-overlay');
    const dialog = dialogOverlay?.querySelector('[role="dialog"]');
    const dialogClose = document.getElementById('dialog-close');
    const dialogOk = document.getElementById('dialog-ok');
    const focusableSelector = 'a[href], button:not([disabled]), textarea, input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
    let restoreFocusTo = null;

    const toggleDialog = (open) => {
      if (!dialogOverlay || !dialog) return;
      if (open) {
        restoreFocusTo = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        dialogOverlay.classList.remove('hidden', 'pointer-events-none');
        dialogOverlay.classList.add('flex');
        dialogOverlay.setAttribute('aria-hidden', 'false');
        const focusables = Array.from(dialog.querySelectorAll(focusableSelector));
        window.setTimeout(() => {
          if (focusables.length) {
            focusables[0].focus();
          } else {
            dialog.focus();
          }
        }, 50);
        document.addEventListener('keydown', trapTab, true);
        document.addEventListener('keydown', handleDialogKeydown, true);
      } else {
        dialogOverlay.classList.add('hidden', 'pointer-events-none');
        dialogOverlay.classList.remove('flex');
        dialogOverlay.setAttribute('aria-hidden', 'true');
        document.removeEventListener('keydown', trapTab, true);
        document.removeEventListener('keydown', handleDialogKeydown, true);
        if (restoreFocusTo) {
          window.setTimeout(() => restoreFocusTo?.focus(), 50);
        }
      }
    };

    const trapTab = (event) => {
      if (event.key !== 'Tab' || !dialog) return;
      const focusables = Array.from(dialog.querySelectorAll(focusableSelector))
        .filter((el) => !el.hasAttribute('disabled') && el.getAttribute('tabindex') !== '-1' && el.offsetParent !== null);
      if (!focusables.length) {
        event.preventDefault();
        dialog.focus();
        return;
      }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey) {
        if (document.activeElement === first || document.activeElement === dialog) {
          event.preventDefault();
          last.focus();
        }
      } else if (document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    const handleDialogKeydown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        toggleDialog(false);
      }
    };

    dialogOverlay?.addEventListener('click', (event) => {
      if (event.target === dialogOverlay) {
        toggleDialog(false);
      }
    });
    dialogClose?.addEventListener('click', () => toggleDialog(false));
    dialogOk?.addEventListener('click', () => toggleDialog(false));

    const getErrorElement = (id) => document.getElementById(id);

    const setFieldError = (field, errorElement, message) => {
      if (!field || !errorElement) return;
      if (message) {
        errorElement.textContent = message;
        errorElement.classList.remove('hidden');
        field.setAttribute('aria-invalid', 'true');
      } else {
        errorElement.textContent = '';
        errorElement.classList.add('hidden');
        field.setAttribute('aria-invalid', 'false');
      }
    };

    const fields = [
      {
        field: contactForm.querySelector('#name'),
        error: getErrorElement('name-error'),
        validate(input) {
          if (!input) return '';
          const value = input.value.trim();
          input.value = value;
          if (!value) return 'Введите имя';
          if (value.length < 2) return 'Минимум 2 символа';
          return '';
        }
      },
      {
        field: contactForm.querySelector('#email'),
        error: getErrorElement('email-error'),
        validate(input) {
          if (!input) return '';
          const value = input.value.trim();
          input.value = value;
          if (!value) return 'Укажите email';
          if (input.validity.typeMismatch) return 'Формат email должен быть вида name@example.com';
          return '';
        }
      },
      {
        field: contactForm.querySelector('#topic'),
        error: getErrorElement('topic-error'),
        validate(select) {
          if (!select) return '';
          if (!select.value) return 'Выберите тему обращения';
          return '';
        }
      },
      {
        field: contactForm.querySelector('#message'),
        error: getErrorElement('message-error'),
        validate(textarea) {
          if (!textarea) return '';
          const value = textarea.value.trim();
          textarea.value = value;
          if (!value) return 'Введите сообщение';
          if (value.length < 10) return 'Сообщение должно содержать минимум 10 символов';
          return '';
        }
      }
    ];

    const validateField = (config) => {
      if (!config.field) return true;
      const message = config.validate(config.field);
      setFieldError(config.field, config.error, message);
      return !message;
    };

    fields.forEach((config) => {
      if (!config.field) return;
      config.field.addEventListener('blur', () => validateField(config));
      config.field.addEventListener('input', () => {
        if (config.field.getAttribute('aria-invalid') === 'true') {
          validateField(config);
        }
      });
    });

    const contactMethodInputs = Array.from(contactForm.querySelectorAll('input[name="contact-method"]'));
    const contactMethodError = getErrorElement('contact-method-error');

    const setRadioError = (message) => {
      if (!contactMethodError) return;
      if (message) {
        contactMethodError.textContent = message;
        contactMethodError.classList.remove('hidden');
      } else {
        contactMethodError.textContent = '';
        contactMethodError.classList.add('hidden');
      }
      contactMethodInputs.forEach((input) => input.setAttribute('aria-invalid', message ? 'true' : 'false'));
    };

    const validateContactMethod = () => {
      if (!contactMethodInputs.length) return true;
      const hasSelection = contactMethodInputs.some((input) => input.checked);
      if (!hasSelection) {
        setRadioError('Выберите предпочтительный канал связи');
      } else {
        setRadioError('');
      }
      return hasSelection;
    };

    contactMethodInputs.forEach((input) => {
      input.addEventListener('change', validateContactMethod);
      input.addEventListener('blur', validateContactMethod);
    });

    contactForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const fieldResults = fields.map((config) => validateField(config));
      const radiosValid = validateContactMethod();
      const isValid = fieldResults.every(Boolean) && radiosValid;

      if (!isValid) {
        announce('Форма заполнена с ошибками. Проверьте подсказки.');
        const firstInvalid = contactForm.querySelector('[aria-invalid="true"]');
        firstInvalid?.focus();
        return;
      }

      contactForm.reset();
      fields.forEach((config) => setFieldError(config.field, config.error, ''));
      setRadioError('');

      if (formStatus) {
        formStatus.textContent = 'Спасибо! Форма успешно заполнена. Сообщение не отправляется на сервер — учебный пример.';
        formStatus.classList.remove('hidden');
      }

      announce('Сообщение успешно отправлено');
      toggleDialog(true);
    });
  }

  const downloadBtn = document.getElementById('download-btn');
  downloadBtn?.addEventListener('click', async () => {
    try {
      const response = await fetch('./assets/resume.pdf');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url; 
      link.download = 'resume.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      announce('Резюме скачано');
    } catch (error) {
      console.error('Download failed:', error);
      announce('Не удалось скачать файл. Проверьте консоль.');
      alert('Не удалось скачать файл. Проверьте консоль для деталей.');
    }
  });
});

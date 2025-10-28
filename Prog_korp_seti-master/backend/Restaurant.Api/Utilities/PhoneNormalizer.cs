using System.Text.RegularExpressions;

namespace Restaurant.Api.Utilities;

/// <summary>
/// Утилита для нормализации и валидации российских номеров телефонов
/// Обрабатывает форматы: +7, 8, пробелы, скобки, дефисы
/// </summary>
public static class PhoneNormalizer
{
    /// <summary>
    /// Нормализует российский номер телефона в формат: только цифры без префикса
    /// Примеры:
    /// - "+7 (123) 456-78-90" -> "1234567890"
    /// - "8 123 456 78 90" -> "1234567890"
    /// - "+7-123-456-78-90" -> "1234567890"
    /// </summary>
    /// <param name="phone">Исходный номер телефона</param>
    /// <returns>Нормализованный номер (только цифры без кода страны)</returns>
    public static string Normalize(string phone)
    {
        if (string.IsNullOrWhiteSpace(phone))
            return string.Empty;

        // Удаляем все символы кроме цифр
        var digitsOnly = Regex.Replace(phone, @"\D", string.Empty);

        // Обрабатываем различные форматы российских номеров
        if (digitsOnly.Length == 11)
        {
            // Формат: 7XXXXXXXXXX или 8XXXXXXXXXX
            if (digitsOnly.StartsWith("7") || digitsOnly.StartsWith("8"))
            {
                return digitsOnly.Substring(1); // Убираем первую цифру (7 или 8)
            }
        }
        else if (digitsOnly.Length == 10)
        {
            // Уже без кода страны
            return digitsOnly;
        }

        // Возвращаем как есть для нестандартных форматов
        return digitsOnly;
    }

    /// <summary>
    /// Нормализует номер для хранения в БД с кодом страны +7
    /// </summary>
    /// <param name="phone">Исходный номер телефона</param>
    /// <returns>Номер в формате +7XXXXXXXXXX</returns>
    public static string NormalizeWithCountryCode(string phone)
    {
        var normalized = Normalize(phone);
        if (string.IsNullOrEmpty(normalized))
            return string.Empty;

        // Добавляем код страны если его нет
        if (normalized.Length == 10)
        {
            return $"+7{normalized}";
        }

        return $"+7{normalized}";
    }

    /// <summary>
    /// Валидация российского номера телефона
    /// Проверяет: минимум 10 цифр, формат российского номера
    /// </summary>
    /// <param name="phone">Номер телефона для проверки</param>
    /// <returns>True если номер валиден</returns>
    public static bool IsValid(string phone)
    {
        if (string.IsNullOrWhiteSpace(phone))
            return false;

        var normalized = Normalize(phone);

        // Российский номер: 10 цифр (код оператора + номер)
        // Первая цифра должна быть 9 (мобильные) или 3-8 (городские)
        if (normalized.Length != 10)
            return false;

        var firstDigit = normalized[0];
        return firstDigit >= '3' && firstDigit <= '9';
    }

    /// <summary>
    /// Валидация номера для поиска (минимум N цифр)
    /// </summary>
    /// <param name="phone">Номер или его часть</param>
    /// <param name="minDigits">Минимальное количество цифр (по умолчанию 4)</param>
    /// <returns>True если можно использовать для поиска</returns>
    public static bool IsValidForSearch(string phone, int minDigits = 4)
    {
        if (string.IsNullOrWhiteSpace(phone))
            return false;

        var digitsOnly = Regex.Replace(phone, @"\D", string.Empty);
        return digitsOnly.Length >= minDigits;
    }

    /// <summary>
    /// Извлекает последние N цифр номера (для поиска)
    /// </summary>
    /// <param name="phone">Номер телефона</param>
    /// <param name="count">Количество последних цифр (по умолчанию 4)</param>
    /// <returns>Последние N цифр</returns>
    public static string GetLastDigits(string phone, int count = 4)
    {
        if (string.IsNullOrWhiteSpace(phone))
            return string.Empty;

        var normalized = Normalize(phone);
        
        return normalized.Length >= count
            ? normalized.Substring(normalized.Length - count)
            : normalized;
    }

    /// <summary>
    /// Форматирует номер для отображения: +7 (XXX) XXX-XX-XX
    /// </summary>
    /// <param name="phone">Номер телефона</param>
    /// <returns>Отформатированный номер</returns>
    public static string Format(string phone)
    {
        if (string.IsNullOrWhiteSpace(phone))
            return string.Empty;

        var normalized = Normalize(phone);

        if (normalized.Length != 10)
            return phone; // Вернуть исходный если не соответствует формату

        // Формат: +7 (XXX) XXX-XX-XX
        return $"+7 ({normalized.Substring(0, 3)}) {normalized.Substring(3, 3)}-{normalized.Substring(6, 2)}-{normalized.Substring(8, 2)}";
    }

    /// <summary>
    /// Маскирует номер для безопасности: +7 (XXX) XXX-**-**
    /// </summary>
    /// <param name="phone">Номер телефона</param>
    /// <returns>Замаскированный номер</returns>
    public static string Mask(string phone)
    {
        if (string.IsNullOrWhiteSpace(phone))
            return string.Empty;

        var normalized = Normalize(phone);

        if (normalized.Length != 10)
            return "***"; // Скрыть полностью если формат неверный

        // Показываем только первые 6 цифр
        return $"+7 ({normalized.Substring(0, 3)}) {normalized.Substring(3, 3)}-**-**";
    }

    /// <summary>
    /// Определяет тип российского номера (мобильный/городской)
    /// </summary>
    /// <param name="phone">Номер телефона</param>
    /// <returns>"mobile", "landline" или "unknown"</returns>
    public static string GetPhoneType(string phone)
    {
        if (string.IsNullOrWhiteSpace(phone))
            return "unknown";

        var normalized = Normalize(phone);

        if (normalized.Length != 10)
            return "unknown";

        var code = normalized.Substring(0, 3);

        // Коды мобильных операторов России
        var mobileCodes = new[] { "900", "901", "902", "903", "904", "905", "906", "908", "909",
                                   "910", "911", "912", "913", "914", "915", "916", "917", "918", "919",
                                   "920", "921", "922", "923", "924", "925", "926", "927", "928", "929",
                                   "930", "931", "932", "933", "934", "936", "937", "938", "939",
                                   "950", "951", "952", "953", "954", "955", "956", "958", "960", "961",
                                   "962", "963", "964", "965", "966", "967", "968", "969",
                                   "970", "971", "977", "978", "980", "981", "982", "983", "984", "985",
                                   "986", "987", "988", "989", "991", "992", "993", "994", "995", "996", "997", "999" };

        if (mobileCodes.Contains(code))
            return "mobile";

        // Остальные считаем городскими
        return "landline";
    }
}

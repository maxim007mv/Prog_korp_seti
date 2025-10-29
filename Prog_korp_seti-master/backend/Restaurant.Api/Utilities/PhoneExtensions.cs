using System.Text.RegularExpressions;

namespace Restaurant.Api.Utilities;

/// <summary>
/// Расширения для работы с номерами телефонов
/// </summary>
public static class PhoneExtensions
{
    /// <summary>
    /// Нормализует номер телефона, оставляя только цифры и знак +
    /// Удаляет пробелы, скобки, дефисы
    /// </summary>
    /// <param name="phone">Исходный номер телефона</param>
    /// <returns>Нормализованный номер</returns>
    public static string NormalizePhone(this string phone)
    {
        if (string.IsNullOrWhiteSpace(phone))
            return string.Empty;

        // Удаляем всё кроме цифр и +
        return Regex.Replace(phone, @"[^\d+]", string.Empty);
    }

    /// <summary>
    /// Извлекает последние N цифр из номера телефона
    /// </summary>
    /// <param name="phone">Номер телефона</param>
    /// <param name="count">Количество последних цифр (по умолчанию 4)</param>
    /// <returns>Последние цифры</returns>
    public static string GetLastDigits(this string phone, int count = 4)
    {
        if (string.IsNullOrWhiteSpace(phone))
            return string.Empty;

        // Получаем только цифры
        var digits = Regex.Replace(phone, @"\D", string.Empty);
        
        return digits.Length >= count 
            ? digits.Substring(digits.Length - count) 
            : digits;
    }

    /// <summary>
    /// Форматирует номер телефона в читаемый вид: +X (XXX) XXX-XX-XX
    /// </summary>
    /// <param name="phone">Номер телефона</param>
    /// <returns>Форматированный номер</returns>
    public static string FormatPhone(this string phone)
    {
        if (string.IsNullOrWhiteSpace(phone))
            return string.Empty;

        var normalized = phone.NormalizePhone();
        var digits = Regex.Replace(normalized, @"\D", string.Empty);

        if (digits.Length < 10)
            return phone; // Слишком короткий номер

        // Форматируем для российских номеров (11 цифр)
        if (digits.Length == 11 && digits.StartsWith("7"))
        {
            return $"+7 ({digits.Substring(1, 3)}) {digits.Substring(4, 3)}-{digits.Substring(7, 2)}-{digits.Substring(9, 2)}";
        }

        // Общий формат для других номеров
        return normalized;
    }

    /// <summary>
    /// Проверяет, содержит ли номер минимальное количество цифр
    /// </summary>
    /// <param name="phone">Номер телефона</param>
    /// <param name="minDigits">Минимальное количество цифр (по умолчанию 4)</param>
    /// <returns>True если номер валиден</returns>
    public static bool IsValidPhone(this string phone, int minDigits = 4)
    {
        if (string.IsNullOrWhiteSpace(phone))
            return false;

        var digits = Regex.Replace(phone, @"\D", string.Empty);
        return digits.Length >= minDigits;
    }
}

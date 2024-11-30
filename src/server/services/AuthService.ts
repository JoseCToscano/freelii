import { BaseService } from "~/server/services/BaseService";
import bcrypt from "bcrypt";
import { env } from "~/env";

export class AuthService extends BaseService {
  private get saltRounds() {
    return env.SALT_ROUNDS;
  }

  /**
   * Hash the password
   * @param plainPassword
   * @private
   */
  private async toHash(plainPassword: string): Promise<string> {
    return bcrypt.hash(plainPassword, this.saltRounds);
  }

  /**
   * Validate the pin for the user
   * @param userId
   * @param pin
   */
  async validatePin(userId: number, pin: string) {
    try {
      const hashedPin = await this.toHash(pin);

      // Save user to the database
      const userCount = await this.db.user.count({
        where: { id: userId, hashedPin: hashedPin },
      });
      if (userCount === 0) {
        return { success: false };
      }

      return { success: true };
    } catch (e) {
      console.error(e);
      return { success: false };
    }
  }

  /**
   * Set the pin for the user
   * @param userId
   * @param pin
   */
  async setPin(userId: number, pin: string) {
    try {
      const hashedPin = await this.toHash(pin);

      // Save user to the database
      const userWithoutPin = await this.db.user.count({
        where: { id: userId, hashedPin: null },
      });
      if (userWithoutPin > 0) {
        throw new Error("User already has a pin");
      }

      await this.db.user.update({
        where: { id: userId },
        data: { hashedPin },
      });

      return { success: true };
    } catch (e) {
      console.error(e);
      return { success: false };
    }
  }
}

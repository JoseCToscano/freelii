import { BaseService } from "~/server/services/BaseService";
import bcrypt from "bcrypt";
import { env } from "~/env";

export class AuthService extends BaseService {
  private get saltRounds() {
    return parseInt(env.SALT_ROUNDS, 10);
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
  async validatePin(
    userId: number,
    pin: string,
  ): Promise<{ success: boolean }> {
    try {
      // Save user to the database
      const user = await this.db.user.findUniqueOrThrow({
        where: { id: userId },
        select: { hashedPin: true },
      });
      if (!user.hashedPin) {
        throw new Error("User does not have a pin");
      }
      const isValid = await bcrypt.compare(pin, user.hashedPin);
      return { success: isValid };
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
  async setPin(userId: number, pin: string): Promise<{ success: boolean }> {
    try {
      const hashedPin = await this.toHash(pin);

      // Save user to the database
      const userWithoutPin = await this.db.user.count({
        where: {
          id: userId,
          hashedPin: {
            not: { equals: null },
          },
        },
      });
      console.log("userWithoutPin", userWithoutPin);
      if (userWithoutPin !== 0) {
        throw new Error("User already has a pin");
      }
      console.log("hashedPin", hashedPin);
      await this.db.user.update({
        where: { id: userId },
        data: { hashedPin },
      });
      console.log("after update :)");

      return { success: true };
    } catch (e) {
      console.error(e);
      return { success: false };
    }
  }
}
